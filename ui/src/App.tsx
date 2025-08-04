import React from 'react';
import { ProtogenLayout } from './components/ProtogenLayout';
import { Button } from './components/ui/button';
import { Layers, Network, MessageSquare } from 'lucide-react';

function App() {
  return (
    <ProtogenLayout>
      {/* Main Content Area - This will eventually contain the stage manager */}
      <div className="pt-16 min-h-screen">
        {/* Welcome Section */}
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Welcome to <span className="text-primary">Protogen</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A community-driven platform for collaborative feedback and knowledge synthesis through interactive graph visualizations.
            </p>
          </div>

          {/* Feature Preview Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Layers className="h-8 w-8 text-primary mr-3" />
                <h3 className="text-lg font-semibold">Stage Manager</h3>
              </div>
              <p className="text-muted-foreground">
                Navigate between different contexts and views with our layer-based interface system.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Network className="h-8 w-8 text-primary mr-3" />
                <h3 className="text-lg font-semibold">Graph Visualization</h3>
              </div>
              <p className="text-muted-foreground">
                Interactive graph visualizations powered by Sigma.js for exploring complex relationships.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center mb-4">
                <MessageSquare className="h-8 w-8 text-primary mr-3" />
                <h3 className="text-lg font-semibold">Community Feedback</h3>
              </div>
              <p className="text-muted-foreground">
                Share feedback, participate in discussions, and contribute to the community knowledge base.
              </p>
            </div>
          </div>

          {/* Stage Manager Placeholder */}
          <div className="bg-card border border-border rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">Stage Manager</h2>
              <p className="text-muted-foreground mb-6">
                The stage manager interface will be implemented here, providing a layer-based navigation system for different contexts and views.
              </p>
              
              {/* Placeholder for stage content */}
              <div className="bg-muted/50 border-2 border-dashed border-muted-foreground/25 rounded-lg p-12">
                <div className="text-muted-foreground">
                  <Layers className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Stage Manager Interface</p>
                  <p className="text-sm">Coming soon...</p>
                </div>
              </div>

              <div className="mt-6 flex justify-center space-x-4">
                <Button variant="outline">
                  <Layers className="h-4 w-4 mr-2" />
                  Create New Stage
                </Button>
                <Button variant="outline">
                  <Network className="h-4 w-4 mr-2" />
                  View Graph
                </Button>
              </div>
            </div>
          </div>

          {/* Development Status */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-muted rounded-full">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm text-muted-foreground">
                Development in Progress - Stage Manager & Graph Visualization Coming Soon
              </span>
            </div>
          </div>
        </div>
      </div>
    </ProtogenLayout>
  );
}

export default App;
