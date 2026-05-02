import { SongPackage } from '@/types/schema';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Download, Music2, ImageIcon, FileText } from 'lucide-react';

interface SongCardProps {
  data: SongPackage;
}

export const SongCard = ({ data }: SongCardProps) => {
  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    window.alert(`${label} copied to clipboard`);
  };

  const downloadPackage = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `suno_package_${data.id.substring(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{data.metadata.title}</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            {data.metadata.style_tags.split(',').slice(0, 4).map((tag, i) => (
              <Badge key={i}>{tag.trim()}</Badge>
            ))}
          </div>
        </div>
        <Button onClick={downloadPackage} variant="outline" className="gap-2">
          <Download className="w-4 h-4" /> Export JSON
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-300" />
                  <CardTitle>Lyrics & Structure</CardTitle>
                </div>
                <Button size="sm" onClick={() => copyToClipboard(data.formatted_lyrics, 'Lyrics')}>
                  <Copy className="w-4 h-4 mr-2" /> Copy All
                </Button>
              </div>
              <CardDescription>Formatted with [Verse], [Chorus] tags for Suno Custom Mode.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="bg-slate-900 rounded-md p-4 h-[500px] overflow-y-auto font-mono text-sm whitespace-pre-wrap border border-slate-800">
                {data.formatted_lyrics}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Music2 className="w-5 h-5 text-indigo-300" />
                <CardTitle>Style Prompt</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-slate-300 bg-slate-900 p-3 rounded-md">
                {data.metadata.style_tags}
              </div>
              <Button className="w-full" onClick={() => copyToClipboard(data.metadata.style_tags, 'Style Tags')}>
                Copy Style
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-indigo-300" />
                <CardTitle>Visual Prompts</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="midjourney">
                <TabsList className="w-full">
                  <TabsTrigger value="midjourney" className="flex-1">Midjourney</TabsTrigger>
                  <TabsTrigger value="sd" className="flex-1">Stable Diffusion</TabsTrigger>
                </TabsList>
                <TabsContent value="midjourney" className="space-y-4 mt-4">
                  <div className="text-xs font-mono bg-slate-950 text-slate-50 p-3 rounded-md break-words">
                    {data.visuals.midjourney}
                  </div>
                  <Button size="sm" className="w-full" onClick={() => copyToClipboard(data.visuals.midjourney, 'Midjourney Prompt')}>
                    Copy Prompt
                  </Button>
                </TabsContent>
                <TabsContent value="sd" className="space-y-4 mt-4">
                  <div className="text-xs font-mono bg-slate-950 text-slate-50 p-3 rounded-md break-words">
                    {data.visuals.stable_diffusion}
                  </div>
                  <Button size="sm" className="w-full" onClick={() => copyToClipboard(data.visuals.stable_diffusion, 'SD Prompt')}>
                    Copy Prompt
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
