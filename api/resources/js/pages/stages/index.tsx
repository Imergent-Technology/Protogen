import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Stage {
  id: number;
  name: string;
  slug: string;
  type: string;
  description?: string;
}

interface Props {
  stages: Stage[];
}

export default function StagesIndex({ stages }: Props) {
  return (
    <AppLayout>
      <Head title="Stages" />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Stages
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse and navigate through all available stages in your progress journey.
          </p>
        </div>

        {stages.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Stages Available
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                There are no stages created yet. Start by creating your first stage!
              </p>
              <Button asChild>
                <a href="/stages/fallback">View Fallback Stage</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stages.map((stage) => (
              <Card key={stage.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{stage.type}</Badge>
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {stage.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stage.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {stage.description}
                    </p>
                  )}
                  <Button asChild className="w-full">
                    <a href={`/stages/${stage.slug}`}>
                      View Stage
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Button variant="outline" asChild>
            <a href="/stages/fallback">View Fallback Stage</a>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
} 