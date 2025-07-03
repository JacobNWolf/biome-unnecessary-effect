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
	pluginName          = "@jacobwolf/biome-unnecessary-effect"
	requiredBiomeVersion = "2.0.0"
	pluginPath          = "node_modules/@jacobwolf/biome-unnecessary-effect/grit/react-effects.grit"
)

type PackageJSON struct {
	DevDependencies map[string]string `json:"devDependencies"`
}

type BiomeJSON struct {
	Schema  string   `json:"$schema"`
	Plugins []string `json:"plugins"`
}

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

func main() {
	if err := setupBiomePlugin(); err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("\n✨ Biome plugin setup complete!")
}

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

    if _, ok := currentConfig["plugins"]; !ok {
        currentConfig["plugins"] = []interface{}{}
    }
    pluginsList, ok := currentConfig["plugins"].([]interface{})
    if !ok {
        return fmt.Errorf("plugins field in biome.json is not a list")
    }

    found := false
    for _, p := range pluginsList {
        if str, ok := p.(string); ok && str == pluginPath {
            found = true
            break
        }
    }

    if !found {
        pluginsList = append(pluginsList, pluginPath)
        currentConfig["plugins"] = pluginsList
        
        updatedBiomeJSON, err := json.MarshalIndent(currentConfig, "", "  ")
        if err != nil {
            return fmt.Errorf("failed to marshal biome.json: %w", err)
        }
        if err := ioutil.WriteFile(biomeJSONPath, updatedBiomeJSON, 0644); err != nil {
            return fmt.Errorf("failed to write updated biome.json: %w", err)
        }
        fmt.Printf("✅ Added %s to biome.json\n", pluginPath)
    } else {
        fmt.Printf("ℹ️ %s is already present in biome.json. No changes made.\n", pluginPath)
    }

	return nil
}
