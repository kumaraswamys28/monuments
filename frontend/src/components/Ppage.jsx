import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"
import { Link } from "react-router-dom"

export function EmptyInputGroup() {
  return (
    <Empty className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20">
      <EmptyHeader className="text-center space-y-8 md:space-y-12">
        <EmptyTitle 
          className="
            text-[min(30vw,280px)] 
            md:text-[min(40vw,420px)] 
            font-black 
            leading-none 
            tracking-tighter
            text-foreground
            drop-shadow-2xl
          "
        >
          404
        </EmptyTitle>
      </EmptyHeader>

      <EmptyContent className="mt-10 md:mt-16">
        <Button size="lg" asChild className="min-w-[180px]">
          <Link to="/">
            <Home className="mr-2 h-5 w-5" />
            Back to Home
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}