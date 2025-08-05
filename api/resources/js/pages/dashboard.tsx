import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        Welcome to Progress
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Track your goals and progress through interactive stages.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="hover:shadow-lg transition-shadow duration-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <span className="text-2xl">📊</span>
                                Stages
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                                Browse and navigate through all available stages in your progress journey.
                            </p>
                            <Button asChild className="w-full">
                                <a href="/stages">View Stages</a>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow duration-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <span className="text-2xl">🎯</span>
                                Fallback Stage
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                                View the default fallback stage with basic content.
                            </p>
                            <Button asChild variant="outline" className="w-full">
                                <a href="/stages/fallback">View Fallback</a>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow duration-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <span className="text-2xl">⚙️</span>
                                Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                                Manage your account settings and preferences.
                            </p>
                            <Button asChild variant="outline" className="w-full">
                                <a href="/settings/profile">View Settings</a>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Getting Started</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Progress tracking is all about breaking down your goals into manageable stages. 
                                Each stage can contain different types of content - from simple text to interactive graphs and documents.
                            </p>
                            <div className="flex gap-2">
                                <Button asChild>
                                    <a href="/stages">Explore Stages</a>
                                </Button>
                                <Button asChild variant="outline">
                                    <a href="/stages/fallback">Try Fallback</a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
