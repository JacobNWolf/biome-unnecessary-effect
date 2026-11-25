import { useEffect } from 'react';

declare function useEditor(): unknown;
declare function useFetcher(): unknown;
declare function useNavigate(): unknown;
declare function useNavigation(): unknown;
declare function useRevalidator(): unknown;
declare function useSearchParams(): unknown;
declare function useForm(): unknown;
declare function useQueryClient(): unknown;

export function ImperativeHandles({ onReady }: { onReady: (value: unknown) => void }) {
  const editor = useEditor();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const revalidator = useRevalidator();
  const searchParams = useSearchParams();
  const form = useForm();
  const client = useQueryClient();
  useEffect(() => {
    onReady(editor);
    onReady(fetcher);
    onReady(navigate);
    onReady(navigation);
    onReady(revalidator);
    onReady(searchParams);
    onReady(form);
    onReady(client);
  }, [editor, fetcher, navigate, navigation, revalidator, searchParams, form, client, onReady]);
}
