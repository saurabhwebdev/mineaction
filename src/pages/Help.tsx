import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

type Section = 'getting-started' | 'projects' | 'activities' | 'action-log' | 'team-management' | 'user-flow';

const Help = () => {
  const [activeSection, setActiveSection] = useState<Section>('getting-started');

  const renderContent = () => {
    switch (activeSection) {
      case 'getting-started':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Getting Started with MineAction</CardTitle>
              <CardDescription>Learn the basics of the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <h2 className="text-xl font-semibold mb-4">Welcome to MineAction</h2>
              <p className="mb-4">
                MineAction is a comprehensive project management platform designed specifically for mine action operations. 
                The platform helps teams track projects, log activities, manage personnel, and generate reports.
              </p>

              <h3 className="text-lg font-medium mt-6 mb-3">User Roles</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Admin</h4>
                  <p className="text-muted-foreground">
                    Full access to all features, including user management, project creation, activity tracking, and reporting.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Supervisor</h4>
                  <p className="text-muted-foreground">
                    Manage projects, teams, and activities. View reports and dashboards.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Operator</h4>
                  <p className="text-muted-foreground">
                    View assigned projects and log activities. Limited administrative capabilities.
                  </p>
                </div>
              </div>

              <h3 className="text-lg font-medium mt-6 mb-3">Basic Navigation</h3>
              <p className="mb-4">
                The main navigation menu provides access to projects, activities logs, and other features based on your role.
                Your user profile can be accessed from the avatar icon in the top right corner.
              </p>
            </CardContent>
          </Card>
        );
      case 'projects':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Project Management</CardTitle>
              <CardDescription>How to work with projects</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="creating-projects">
                  <AccordionTrigger>Creating a New Project</AccordionTrigger>
                  <AccordionContent>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Navigate to the Projects page from the main navigation.</li>
                      <li>Click the "Create Project" button in the top-right corner.</li>
                      <li>Fill in the required project details:
                        <ul className="list-disc pl-5 mt-2">
                          <li>Project Name (required)</li>
                          <li>Project Description</li>
                          <li>Project Type</li>
                          <li>Location</li>
                          <li>Start Date (required)</li>
                          <li>End Date (optional)</li>
                          <li>Status (defaults to "Planning")</li>
                        </ul>
                      </li>
                      <li>Click "Create Project" to save.</li>
                    </ol>
                    <p className="mt-4 text-sm text-muted-foreground">
                      Note: Only users with Admin or Supervisor roles can create new projects.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="editing-projects">
                  <AccordionTrigger>Editing Project Details</AccordionTrigger>
                  <AccordionContent>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Navigate to the Projects page and click on the project you wish to edit.</li>
                      <li>On the project details page, click the "Edit Project" button.</li>
                      <li>Update the project details as needed.</li>
                      <li>Click "Update Project" to save your changes.</li>
                    </ol>
                    <p className="mt-4 text-sm text-muted-foreground">
                      Note: Project editing is restricted to Admin and Supervisor roles, or the Project Manager.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="project-navigation">
                  <AccordionTrigger>Project Details Navigation</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">The project details page is organized into three main tabs:</p>
                    <ol className="list-decimal pl-5 space-y-3">
                      <li>
                        <strong>Details</strong>: View project information including description, type, location, 
                        start/end dates, and project status.
                      </li>
                      <li>
                        <strong>Team</strong>: View and manage team members assigned to the project. Admins and 
                        Supervisors can add members, change roles, or remove members.
                      </li>
                      <li>
                        <strong>Activities</strong>: View, log, and manage activities associated with the project.
                        Activities can be filtered, searched, and viewed in different formats.
                      </li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        );
      case 'activities':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Activity Management</CardTitle>
              <CardDescription>Working with activity logs</CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-medium mb-4">Activity Management User Flow</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Logging a New Activity</h4>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Navigate to a project's details page.</li>
                    <li>Select the "Activities" tab.</li>
                    <li>Use the activity form on the left panel to enter:
                      <ul className="list-disc pl-5 mt-1">
                        <li>Activity Type (e.g., Drilling, Blasting, Survey)</li>
                        <li>Shift (Morning, Afternoon, Night)</li>
                        <li>Date</li>
                        <li>Crew information</li>
                        <li>Optional remarks</li>
                      </ul>
                    </li>
                    <li>Click "Log Activity" to save the new entry.</li>
                  </ol>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold mb-2">Searching and Filtering Activities</h4>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>On the Activities tab, find the filters section at the top.</li>
                    <li>Use the search box to find activities by crew name, remarks, or activity type.</li>
                    <li>Use the activity type dropdown to filter by a specific activity type.</li>
                    <li>Set date range filters to narrow results by time period.</li>
                    <li>Click "Reset Filters" to clear all filters and see all activities.</li>
                  </ol>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold mb-2">Timeline vs. List View</h4>
                  <p className="mb-2">Activities can be viewed in two different formats:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <strong>Timeline View</strong>: Shows activities chronologically with visual indicators
                      for different activity types. Best for seeing the history and sequence of activities.
                    </li>
                    <li>
                      <strong>List View</strong>: Displays activities in a more compact, tabular format.
                      Good for scanning many activities at once.
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case 'action-log':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Action Log System</CardTitle>
              <CardDescription>Managing corrective and preventive actions</CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-medium mb-4">Action Log System Overview</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">What is the Action Log System?</h4>
                  <p className="mb-3">
                    The Action Log System allows teams to track corrective and preventive actions linked to specific activities. 
                    This feature helps ensure issues are properly documented, assigned to responsible personnel, and tracked to completion.
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold mb-2">Creating a New Action</h4>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Navigate to an activity record.</li>
                    <li>Click the "Add Action" button.</li>
                    <li>Fill in the action details:
                      <ul className="list-disc pl-5 mt-1">
                        <li><strong>Issue</strong>: Description of the problem or required action</li>
                        <li><strong>Responsible Person</strong>: Person assigned to complete the action</li>
                        <li><strong>Due Date</strong>: Deadline for completion</li>
                        <li><strong>Priority</strong>: Low, Medium, High, or Critical</li>
                        <li><strong>Status</strong>: Pending, In Progress, Completed, or Overdue</li>
                      </ul>
                    </li>
                    <li>Click "Create Action" to save.</li>
                  </ol>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold mb-2">Action Tracking</h4>
                  <p className="mb-2">Monitor and update actions through the Action Tracker:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>View all actions in a sortable, filterable table</li>
                    <li>Filter by status, priority, due date, or responsible person</li>
                    <li>Add comments and evidence to document progress</li>
                    <li>Update action status as work progresses</li>
                    <li>Receive notifications for overdue or high-priority actions</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case 'team-management':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Team Management</CardTitle>
              <CardDescription>Managing project team members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Adding Team Members</h4>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Navigate to a project's details page.</li>
                    <li>Select the "Team" tab.</li>
                    <li>Click the "Add Member" button in the top-right corner.</li>
                    <li>From the dialog, select a user from the dropdown.</li>
                    <li>Assign a role to the user from the role dropdown.</li>
                    <li>Click "Add to Project" to confirm.</li>
                  </ol>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Note: Only users with Admin or Supervisor roles can add team members.
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold mb-2">Understanding Project Roles</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <strong>Project Manager</strong>: Overall responsibility for the project. Can edit project 
                      details and manage team members.
                    </li>
                    <li>
                      <strong>Field Supervisor</strong>: Oversees field operations and can log activities.
                    </li>
                    <li>
                      <strong>Technical Advisor</strong>: Provides technical expertise and guidance.
                    </li>
                    <li>
                      <strong>Team Member</strong>: Regular project participant with standard access.
                    </li>
                    <li>
                      <strong>Observer</strong>: Limited access for monitoring purposes only.
                    </li>
                  </ul>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold mb-2">Managing Team Members</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <strong>Changing Roles</strong>: Click the role dropdown next to a team member's name to change their role.
                    </li>
                    <li>
                      <strong>Removing Members</strong>: Click the "Remove" button in the Actions column to remove a member.
                    </li>
                    <li>
                      <strong>Viewing History</strong>: See when members were added and their role changes in the activity log.
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case 'user-flow':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Application User Flow</CardTitle>
              <CardDescription>Understanding the typical workflow in MineAction</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-6">
                Understanding the typical workflow in MineAction will help you navigate the platform more efficiently.
                Below is a step-by-step guide of the recommended user flow:
              </p>

              <div className="relative p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex flex-col space-y-6">
                  {/* Step 1 */}
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">1</div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-lg">Project Creation</h3>
                      <p className="text-muted-foreground">
                        Admin or Supervisor creates a new project with basic details including name, location, and timeline.
                      </p>
                      <p className="text-sm mt-1 text-primary">
                        → Navigate to: Projects → Create Project
                      </p>
                    </div>
                  </div>
                  
                  {/* Connector */}
                  <div className="w-0.5 h-6 bg-gray-300 ml-5"></div>
                  
                  {/* Step 2 */}
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">2</div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-lg">Team Assignment</h3>
                      <p className="text-muted-foreground">
                        Project Manager adds team members to the project and assigns appropriate roles.
                      </p>
                      <p className="text-sm mt-1 text-primary">
                        → Navigate to: Project Details → Team Tab → Add Member
                      </p>
                    </div>
                  </div>
                  
                  {/* Connector */}
                  <div className="w-0.5 h-6 bg-gray-300 ml-5"></div>
                  
                  {/* Step 3 */}
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">3</div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-lg">Activity Logging</h3>
                      <p className="text-muted-foreground">
                        Team members log daily activities as they occur, including details like activity type, crew, and shift.
                      </p>
                      <p className="text-sm mt-1 text-primary">
                        → Navigate to: Project Details → Activities Tab → Log Activity
                      </p>
                    </div>
                  </div>
                  
                  {/* Connector */}
                  <div className="w-0.5 h-6 bg-gray-300 ml-5"></div>
                  
                  {/* Step 4 */}
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">4</div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-lg">Action Creation</h3>
                      <p className="text-muted-foreground">
                        When issues arise, create actions linked to specific activities, assign responsibility, and set due dates.
                      </p>
                      <p className="text-sm mt-1 text-primary">
                        → Navigate to: Activity Details → Add Action
                      </p>
                    </div>
                  </div>
                  
                  {/* Connector */}
                  <div className="w-0.5 h-6 bg-gray-300 ml-5"></div>
                  
                  {/* Step 5 */}
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">5</div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-lg">Action Tracking</h3>
                      <p className="text-muted-foreground">
                        Monitor actions through the Action Tracker, update statuses, and add evidence as work progresses.
                      </p>
                      <p className="text-sm mt-1 text-primary">
                        → Navigate to: Action Tracker → View Details
                      </p>
                    </div>
                  </div>
                  
                  {/* Connector */}
                  <div className="w-0.5 h-6 bg-gray-300 ml-5"></div>
                  
                  {/* Step 6 */}
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">6</div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-lg">Project Monitoring</h3>
                      <p className="text-muted-foreground">
                        Supervisors and Admins monitor overall project progress, review activities, and ensure actions are completed.
                      </p>
                      <p className="text-sm mt-1 text-primary">
                        → Navigate to: Projects → Dashboard
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold mb-2">Key Workflows</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <strong>Daily Operations</strong>: Log activities → Review pending actions → Update action status
                    </li>
                    <li>
                      <strong>Project Management</strong>: Review project status → Manage team assignments → Monitor action completion
                    </li>
                    <li>
                      <strong>Administration</strong>: Create projects → Assign project managers → Review overall performance
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Help & Documentation</h1>
      <p className="text-muted-foreground mb-8">
        Welcome to the MineAction help center. Find guides and information on how to use the platform effectively.
      </p>

      <div className="flex gap-6">
        {/* Side Navigation Menu */}
        <div className="w-64 flex-shrink-0">
          <div className="space-y-1">
            <button 
              onClick={() => setActiveSection('getting-started')}
              className={`w-full text-left px-4 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground ${
                activeSection === 'getting-started' ? 'bg-accent text-accent-foreground font-medium' : ''
              }`}
            >
              Getting Started
            </button>
            <button 
              onClick={() => setActiveSection('projects')}
              className={`w-full text-left px-4 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground ${
                activeSection === 'projects' ? 'bg-accent text-accent-foreground font-medium' : ''
              }`}
            >
              Projects
            </button>
            <button 
              onClick={() => setActiveSection('activities')}
              className={`w-full text-left px-4 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground ${
                activeSection === 'activities' ? 'bg-accent text-accent-foreground font-medium' : ''
              }`}
            >
              Activities
            </button>
            <button 
              onClick={() => setActiveSection('action-log')}
              className={`w-full text-left px-4 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground ${
                activeSection === 'action-log' ? 'bg-accent text-accent-foreground font-medium' : ''
              }`}
            >
              Action Log
            </button>
            <button 
              onClick={() => setActiveSection('team-management')}
              className={`w-full text-left px-4 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground ${
                activeSection === 'team-management' ? 'bg-accent text-accent-foreground font-medium' : ''
              }`}
            >
              Team Management
            </button>
            <button 
              onClick={() => setActiveSection('user-flow')}
              className={`w-full text-left px-4 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground ${
                activeSection === 'user-flow' ? 'bg-accent text-accent-foreground font-medium' : ''
              }`}
            >
              Application User Flow
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Help; 