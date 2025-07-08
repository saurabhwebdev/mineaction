import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="py-8">
      {/* Hero Section */}
      <section className="py-16 text-center">
        <h1 className="text-5xl font-bold mb-6">MineAction</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          A comprehensive project management platform designed specifically for mine action operations.
        </p>
        <div className="flex justify-center gap-4">
          <Button className="rounded-full px-8" onClick={() => navigate('/projects')}>Get Started</Button>
          <Button variant="outline" className="rounded-full px-8" onClick={() => navigate('/help')}>Learn More</Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
                    <path d="M2 17 12 22 22 17" />
                    <path d="M2 12 12 17 22 12" />
                    <path d="M12 2 2 7 12 12 22 7 12 2Z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium">Project Management</h3>
                <p className="text-gray-600">Create and manage mine action projects with comprehensive tracking and team coordination.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium">Activity Logging</h3>
                <p className="text-gray-600">Track daily operations, shifts, and field activities with detailed logging capabilities.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium">Action Tracking</h3>
                <p className="text-gray-600">Monitor corrective and preventive actions with priority-based tracking system.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-medium mb-3">Team Management</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Assign roles and responsibilities</li>
                <li>• Coordinate field operations</li>
                <li>• Track team performance</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-medium mb-3">Reporting & Analytics</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Generate detailed reports</li>
                <li>• Monitor project progress</li>
                <li>• Track key metrics</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50 rounded-2xl my-12 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to streamline your operations?</h2>
          <p className="text-gray-600 mb-8">Start managing your mine action projects more effectively today.</p>
          <Button className="rounded-full px-8" onClick={() => navigate('/projects')}>Get Started Now</Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
