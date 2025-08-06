import { Toolbar } from '../toolbar/Toolbar';
import { useModal } from '../modals/ModalProvider';
import { useToast } from '../../hooks/use-toast';
import { useConfirm } from '../../hooks/useConfirm';
import { FormModal } from '../modals/FormModal';

export function ToolbarDemo() {
  const { openModal } = useModal();
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const handleNavigation = async (path: string) => {
    console.log('Navigation requested to:', path);

    // Handle demo actions
    switch (path) {
      case '/demo/modal':
        openModal({
          component: () => (
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4">Demo Modal</h2>
              <p>This is a test modal to demonstrate the modal system!</p>
            </div>
          ),
          options: { size: 'md' }
        });
        break;

      case '/demo/toast':
        toast({
          title: "Toast Demo",
          description: "This is a test toast notification!",
        });
        break;

      case '/demo/confirm':
        const confirmed = await confirm({
          title: "Demo Confirmation",
          description: "This is a test confirmation dialog. Do you want to proceed?",
          confirmText: "Yes, proceed",
          cancelText: "Cancel"
        });
        
        toast({
          title: confirmed ? "Confirmed!" : "Cancelled",
          description: confirmed ? "You clicked proceed!" : "You clicked cancel!",
        });
        break;

      case '/settings':
        openModal({
          component: FormModal,
          props: {
            title: "Settings Demo",
            description: "This would be a settings form",
            children: (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Demo Setting</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded" 
                    placeholder="Enter a value..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Another Setting</label>
                  <select className="w-full p-2 border rounded">
                    <option>Option 1</option>
                    <option>Option 2</option>
                    <option>Option 3</option>
                  </select>
                </div>
              </div>
            ),
            onSubmit: () => {
              toast({
                title: "Settings Saved",
                description: "Demo settings have been saved!",
              });
            }
          },
          options: { size: 'lg' }
        });
        break;

      default:
        toast({
          title: "Navigation Demo",
          description: `Would navigate to: ${path}`,
        });
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Toolbar onNavigate={handleNavigation} />
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Toolbar Demo</h1>
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Test the Toolbar</h2>
            <p className="text-muted-foreground mb-4">
              Click the hamburger menu (☰) in the top-left corner to test different navigation options:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li><strong>Dashboard, Stages, Graph View:</strong> Show toast notifications</li>
              <li><strong>Settings:</strong> Opens a demo form modal</li>
              <li><strong>Help:</strong> Shows toast notification</li>
              <li><strong>Demo: Modal Test:</strong> Opens a simple modal</li>
              <li><strong>Demo: Toast Test:</strong> Shows a toast notification</li>
              <li><strong>Demo: Confirm Test:</strong> Shows a confirmation dialog</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}