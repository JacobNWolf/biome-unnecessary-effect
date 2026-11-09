package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

const (
	pluginName           = "@jacobwolf/biome-unnecessary-effect"
	requiredBiomeVersion = "2.0.0"
	rulesDir             = "node_modules/@jacobwolf/biome-unnecessary-effect/grit/rules"
	legacyPluginPath     = "node_modules/@jacobwolf/biome-unnecessary-effect/grit/react-effects.grit"
)

type PackageJSON struct {
	DevDependencies map[string]string `json:"devDependencies"`
}

type BiomeJSON struct {
	Schema  string   `json:"$schema"`
	Plugins []string `json:"plugins"`
}

// compareVersions compares dotted version strings part by part and returns -1, 0, or 1.
func compareVersions(v1, v2 string) int {
	parts1 := strings.Split(v1, ".")
	parts2 := strings.Split(v2, ".")

	maxLen := len(parts1)
	if len(parts2) > maxLen {
		maxLen = len(parts2)
	}

	for i := 0; i < maxLen; i++ {
		p1 := 0
		if i < len(parts1) {
			p1, _ = strconv.Atoi(parts1[i])
		}
		p2 := 0
		if i < len(parts2) {
			p2, _ = strconv.Atoi(parts2[i])
		}

		if p1 > p2 {
			return 1
		}
		if p1 < p2 {
			return -1
		}
	}
	return 0
}

// main applies the plugin configuration to the current project and exits on failure.
func main() {
	if err := setupBiomePlugin(); err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("\n✨ Biome plugin setup complete!")
}

// setupBiomePlugin registers every bundled rule file in the project's biome.json,
// replacing the single-file v0.1 entry when it is present.
func setupBiomePlugin() error {
	cwd, err := os.Getwd()
	if err != nil {
		return fmt.Errorf("failed to get current working directory: %w", err)
	}

	packageJSONPath := filepath.Join(cwd, "package.json")
	biomeJSONPath := filepath.Join(cwd, "biome.json")

	fmt.Println("Checking Biome version...")
	packageJSONContent, err := ioutil.ReadFile(packageJSONPath)
	if err != nil {
		return fmt.Errorf("failed to read package.json at %s: %w", packageJSONPath, err)
	}

	var pkg PackageJSON
	if err := json.Unmarshal(packageJSONContent, &pkg); err != nil {
		return fmt.Errorf("failed to parse package.json: %w", err)
	}

	biomeVersion, ok := pkg.DevDependencies["@biomejs/biome"]
	if !ok {
		return fmt.Errorf("@biomejs/biome not found in devDependencies. Please install it (e.g., `npm install -D @biomejs/biome`).")
	}

	cleanBiomeVersion := strings.TrimPrefix(strings.TrimPrefix(biomeVersion, "^"), "~")

	if compareVersions(cleanBiomeVersion, requiredBiomeVersion) < 0 {
		return fmt.Errorf("@biomejs/biome version %s is less than the required %s. Please upgrade.", biomeVersion, requiredBiomeVersion)
	}
	fmt.Printf("✅ @biomejs/biome version %s meets the requirement (%s or greater).\n", biomeVersion, requiredBiomeVersion)

	fmt.Println("Configuring biome.json...")

	biomeJSONContent, err := ioutil.ReadFile(biomeJSONPath)
	if err != nil {
		if os.IsNotExist(err) {
			return fmt.Errorf("biome.json not found at %s. The plugin cannot be added without an existing biome.json file. Please create it manually if you wish to add the plugin.", biomeJSONPath)
		}
		return fmt.Errorf("failed to read biome.json at %s: %w", biomeJSONPath, err)
	}

	var currentConfig map[string]interface{}
	if err := json.Unmarshal(biomeJSONContent, &currentConfig); err != nil {
		return fmt.Errorf("failed to parse biome.json: %w", err)
	}

	ruleFiles, err := filepath.Glob(filepath.Join(cwd, rulesDir, "*.grit"))
	if err != nil {
		return fmt.Errorf("failed to list plugin rule files: %w", err)
	}
	if len(ruleFiles) == 0 {
		return fmt.Errorf("no plugin rule files found in %s", filepath.Join(cwd, rulesDir))
	}

	rulePaths := make([]interface{}, 0, len(ruleFiles))
	for _, file := range ruleFiles {
		relative, err := filepath.Rel(cwd, file)
		if err != nil {
			return fmt.Errorf("failed to resolve plugin path %s: %w", file, err)
		}
		rulePaths = append(rulePaths, filepath.ToSlash(relative))
	}

	var pluginsList []interface{}
	if raw, ok := currentConfig["plugins"]; ok {
		if pluginsList, ok = raw.([]interface{}); !ok {
			return fmt.Errorf("plugins field in biome.json is not a list")
		}
	}

	updated := make([]interface{}, 0, len(pluginsList)+len(rulePaths))
	changed := false
	for _, p := range pluginsList {
		if str, ok := p.(string); ok && str == legacyPluginPath {
			changed = true
			continue
		}
		updated = append(updated, p)
	}

	for _, rulePath := range rulePaths {
		found := false
		for _, p := range updated {
			if str, ok := p.(string); ok && str == rulePath {
				found = true
				break
			}
		}
		if !found {
			updated = append(updated, rulePath)
			changed = true
		}
	}

	if !changed {
		fmt.Println("ℹ️ Plugin rules are already present in biome.json. No changes made.")
		return nil
	}

	currentConfig["plugins"] = updated

	updatedBiomeJSON, err := json.MarshalIndent(currentConfig, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal biome.json: %w", err)
	}
	if err := ioutil.WriteFile(biomeJSONPath, updatedBiomeJSON, 0644); err != nil {
		return fmt.Errorf("failed to write updated biome.json: %w", err)
	}
	fmt.Printf("✅ Registered %d plugin rule file(s) in biome.json\n", len(rulePaths))

	return nil
}
