import { SongPackage } from '@/types/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface JsonPreviewProps {
  data: SongPackage;
}

export const JsonPreview = ({ data }: JsonPreviewProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Raw JSON</CardTitle>
    </CardHeader>
    <CardContent>
      <pre className="text-xs text-slate-300 bg-slate-950 p-4 rounded-md overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </CardContent>
  </Card>
);
