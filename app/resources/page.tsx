import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Download, PlayCircle, BookOpen } from "lucide-react"

export default function ResourcesPage() {
  const resources = [
    {
      title: "Admission Guides",
      description: "Step-by-step guides for applying to universities abroad.",
      icon: BookOpen,
      count: "15 Guides",
    },
    {
      title: "Document Templates",
      description: "Download templates for SOPs, LORs, and CVs.",
      icon: FileText,
      count: "20 Templates",
    },
    {
      title: "Webinar Recordings",
      description: "Watch recorded sessions with university representatives.",
      icon: PlayCircle,
      count: "50+ Videos",
    },
    {
      title: "Country Brochures",
      description: "Detailed brochures for all our study destinations.",
      icon: Download,
      count: "10 Brochures",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-primary/5 py-24 px-4 md:px-8 border-b">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">Student Resources</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to plan your study abroad journey, all in one place.
          </p>
        </div>
      </section>

      <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {resources.map((resource) => (
            <Card key={resource.title} className="group hover:shadow-xl transition-all border-border/50 bg-card p-4">
              <CardHeader className="flex flex-row items-center gap-6 space-y-0">
                <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                  <resource.icon className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-bold">{resource.title}</CardTitle>
                  <p className="text-sm font-bold text-primary uppercase tracking-widest">{resource.count}</p>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-muted-foreground text-lg leading-relaxed mb-6">{resource.description}</p>
                <div className="flex gap-4">
                  <button className="text-primary font-bold hover:underline inline-flex items-center gap-2">
                    Access Library <Download className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
