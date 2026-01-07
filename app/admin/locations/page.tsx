"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CountriesTab } from "@/components/locations/countries-tab"
import { StatesTab } from "@/components/locations/states-tab"
import { CitiesTab } from "@/components/locations/cities-tab"

export default function LocationsPage() {
  const [activeTab, setActiveTab] = useState("countries")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Location Management</h1>
        <p className="text-muted-foreground">Manage countries, states, and cities</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="countries">Countries</TabsTrigger>
          <TabsTrigger value="states">States</TabsTrigger>
          <TabsTrigger value="cities">Cities</TabsTrigger>
        </TabsList>

        <TabsContent value="countries" className="mt-6">
          <CountriesTab />
        </TabsContent>

        <TabsContent value="states" className="mt-6">
          <StatesTab />
        </TabsContent>

        <TabsContent value="cities" className="mt-6">
          <CitiesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
