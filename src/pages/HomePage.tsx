import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function HomePage() {
  return (
    <div className="container mx-auto max-w-4xl py-20 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
          Starter Project
        </h1>
        <p className="text-xl text-muted-foreground">
          Minimal CRUD UI against the backend OpenAPI.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Greetings Module</CardTitle>
            <CardDescription>
              A simple CRUD example for managing greeting messages.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/greetings">Go to Greetings</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Placeholder for future modules */}
        <Card className="opacity-60 dashed border-2">
          <CardHeader>
            <CardTitle>Future Module</CardTitle>
            <CardDescription>
              More features can be added here easily.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled variant="secondary" className="w-full">
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
