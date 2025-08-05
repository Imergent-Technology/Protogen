import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BasicStageConfig {
  title?: string;
  content?: string;
  icon?: string;
  showFallback?: boolean;
}

interface BasicStageProps {
  config: BasicStageConfig;
  isFallback?: boolean;
  stageType?: string;
}

export function BasicStage({ config, isFallback = false, stageType = 'basic' }: BasicStageProps) {
  // Fallback content if no config is provided
  const title = config?.title || 'Welcome! 👋';
  const content = config?.content || 'This is a simple stage with basic content. Each stage can be customized with different types of content and interactions.';
  const icon = config?.icon || '✨';

  return (
    <Card className="shadow-lg">
      <CardHeader className="text-center pb-4">
        <div className="text-6xl mb-4">{icon}</div>
        <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
            {content}
          </p>
        </div>
        

      </CardContent>
    </Card>
  );
} 