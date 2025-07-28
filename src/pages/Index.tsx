const Index = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your project management dashboard
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Project cards will go here */}
        <div className="col-span-full flex items-center justify-center h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-4">Create your first project to get started</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
