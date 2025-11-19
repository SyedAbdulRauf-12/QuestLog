import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Brain, Zap, Trophy } from "lucide-react";
export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4 text-primary">How It Works</h2>
        <p className="text-gray-600 mb-12">Stop tracking, start achieving.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <Card>
            <CardHeader className="items-center">
              <Brain className="w-12 h-12 text-indigo-600 mb-4" />
              <CardTitle>AI-Powered Planning</CardTitle>
              <CardDescription>
                Tell us your goal. Our AI will build a custom roadmap with daily tasks and milestones.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="items-center">
              <Zap className="w-12 h-12 text-green-600 mb-4" />
              <CardTitle>Gamify Your Grind</CardTitle>
              <CardDescription>
                Complete tasks to earn XP. Level up and unlock achievements just like in a game.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="items-center">
              <Trophy className="w-12 h-12 text-yellow-500 mb-4" />
              <CardTitle>Compete & Conquer</CardTitle>
              <CardDescription>
                Climb the global leaderboards and see how you stack up against other users.
              </CardDescription>
            </CardHeader>
          </Card>

        </div>
      </div>
    </section>
  );
}