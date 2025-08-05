import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { BasicStage } from '@/components/BasicStage';

interface Stage {
  id?: number;
  name: string;
  slug: string;
  description?: string;
  type: string;
  config: {
    title?: string;
    content?: string;
    icon?: string;
    showFallback?: boolean;
  };
  is_active: boolean;
  sort_order: number;
}

interface Props {
  stage: Stage;
  isFallback?: boolean;
}

export default function StageShow({ stage, isFallback = false }: Props) {
  return (
    <AppLayout>
      <Head title={stage.name} />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Badge variant="secondary" className="mb-2">
            {isFallback ? 'Fallback Stage' : stage.type}
          </Badge>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {stage.name}
          </h1>
          {stage.description && (
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {stage.description}
            </p>
          )}
        </div>

        <BasicStage 
          config={stage.config} 
          isFallback={isFallback} 
          stageType={stage.type}
        />

        <div className="mt-8 text-center">
          <a 
            href="/stages" 
            className="inline-flex items-center px-4 py-2 bg-gray-800 dark:bg-gray-200 border border-transparent rounded-md font-semibold text-xs text-white dark:text-gray-800 uppercase tracking-widest hover:bg-gray-700 dark:hover:bg-white focus:bg-gray-700 dark:focus:bg-white active:bg-gray-900 dark:active:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition ease-in-out duration-150"
          >
            View All Stages
          </a>
        </div>
      </div>
    </AppLayout>
  );
} 