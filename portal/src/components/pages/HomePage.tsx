import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@protogen/shared';
import { 
  Layers, 
  Network, 
  MessageSquare, 
  BookOpen, 
  Play, 
  Users, 
  TrendingUp,
  Clock,
  Star
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const recentScenes = [
    { id: 1, name: 'Welcome to Protogen', type: 'scene', lastAccessed: '2 hours ago' },
    { id: 2, name: 'System Overview', type: 'scene', lastAccessed: 'Yesterday' },
    { id: 3, name: 'Getting Started Guide', type: 'scene', lastAccessed: '3 days ago' },
  ];

  const recentDecks = [
    { id: 1, name: 'Learning Fundamentals', scenes: 8, lastAccessed: '1 day ago' },
    { id: 2, name: 'Advanced Concepts', scenes: 12, lastAccessed: '4 days ago' },
    { id: 3, name: 'Case Studies', scenes: 6, lastAccessed: '1 week ago' },
  ];

  const stats = [
    { label: 'Scenes Explored', value: '24', icon: Layers, change: '+3 this week' },
    { label: 'Decks Completed', value: '8', icon: BookOpen, change: '+2 this week' },
    { label: 'Engagement Score', value: '85%', icon: TrendingUp, change: '+5% this week' },
    { label: 'Time Spent', value: '12h', icon: Clock, change: '+2h this week' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground">
          Continue your journey through interactive content and collaborative learning.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-green-600">{stat.change}</p>
                </div>
                <stat.icon className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Scenes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Layers className="h-5 w-5" />
              <span>Recent Scenes</span>
            </CardTitle>
            <CardDescription>
              Continue where you left off
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentScenes.map((scene) => (
              <div
                key={scene.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                    <Play className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{scene.name}</p>
                    <p className="text-xs text-muted-foreground">{scene.lastAccessed}</p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  {scene.type}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Decks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Recent Decks</span>
            </CardTitle>
            <CardDescription>
              Organized collections of content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentDecks.map((deck) => (
              <div
                key={deck.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{deck.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {deck.scenes} scenes • {deck.lastAccessed}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  deck
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Jump into your favorite activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
              <div className="h-10 w-10 rounded bg-green-100 flex items-center justify-center">
                <Network className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Explore Graph</p>
                <p className="text-sm text-muted-foreground">Navigate relationships</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
              <div className="h-10 w-10 rounded bg-purple-100 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Engage</p>
                <p className="text-sm text-muted-foreground">Join discussions</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
              <div className="h-10 w-10 rounded bg-orange-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium">Community</p>
                <p className="text-sm text-muted-foreground">Connect with others</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
