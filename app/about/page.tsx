import { CheckCircle2, Users, Target, Award } from "lucide-react"

export default function AboutPage() {
  const stats = [
    { label: "Students Assisted", value: "5000+", icon: Users },
    { label: "Visa Success Rate", value: "99%", icon: CheckCircle2 },
    { label: "Partner Universities", value: "100+", icon: Target },
    { label: "Years of Experience", value: "10+", icon: Award },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-primary/5 py-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">About AbroadPen</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Empowering students to reach their full potential through global education since 2015.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center space-y-2 p-8 rounded-3xl bg-muted/30 border border-border/50">
              <stat.icon className="h-10 w-10 text-primary mx-auto mb-4" />
              <div className="text-4xl font-black text-primary">{stat.value}</div>
              <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-8">
          <h2 className="text-4xl font-bold">Our Mission</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            At AbroadPen, we believe that education has no borders. Our mission is to bridge the gap between ambitious
            students and world-class international institutions by providing transparent, expert, and personalized
            consulting services.
          </p>
          <div className="space-y-4">
            {[
              "Unbiased university recommendations",
              "End-to-end application management",
              "Expert visa guidance and documentation",
              "Pre and post-departure support",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 font-semibold">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 bg-primary/10 rounded-[2rem] blur-2xl" />
          <img
            src="/about-us-illustration.jpg"
            alt="About AbroadPen"
            className="relative rounded-[2rem] shadow-2xl border-4 border-white"
          />
        </div>
      </section>
    </div>
  )
}
