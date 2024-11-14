import { Link } from "@tanstack/react-router";

import { Button } from "./ui/button";

export function NotFound() {
  return (
    <div className="flex flex-col items-center gap-6 p-8 text-gray-800">
        <p className="text-6xl font-extrabold text-red-500">404</p>
        <p className="text-2xl font-semibold">Page not found</p>
        <p className="text-center text-gray-600">
          The page you're looking for doesn’t exist or has been moved.
        </p>
        <Button asChild className="px-6 py-3 text-white bg-[#16A34A] rounded-lg shadow-md hover:bg-green-700">
          <Link to="/">Go Home</Link>
        </Button>
      </div>
  );
}