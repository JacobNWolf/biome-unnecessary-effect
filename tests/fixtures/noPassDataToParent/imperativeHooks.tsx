import { useEffect } from 'react';

declare function useEditor(): unknown;
declare function useFetcher(): unknown;
declare function useNavigate(): unknown;
declare function useForm(): unknown;
declare function useQueryClient(): unknown;

export function ImperativeHandles({ onReady }: { onReady: (value: unknown) => void }) {
  const editor = useEditor();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const form = useForm();
  const client = useQueryClient();
  useEffect(() => {
    onReady(editor);
    onReady(fetcher);
    onReady(navigate);
    onReady(form);
    onReady(client);
  }, [editor, fetcher, navigate, form, client, onReady]);
}
