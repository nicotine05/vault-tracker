"use client";

import Link from "next/link";
import Card from "@/components/Card";

export default function LogsPage() {
  return (
    <main className="max-w-md mx-auto p-4 pb-20">
      <h1 className="text-3xl font-bold mb-4">
        Logs
      </h1>

      <div className="space-y-4">

        <Link href="/logs/vault">
          <Card className="hover:shadow-lg transition cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-bold">
                  🏆 Vault Log
                </p>

                <p className="text-gray-500 text-sm">
                  Track vault sessions,
                  technical keys, grip,
                  run and jump quality
                </p>
              </div>

              <span className="text-2xl">
                →
              </span>
            </div>
          </Card>
        </Link>

        <Link href="/logs/sprint">
          <Card className="hover:shadow-lg transition cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-bold">
                  🏃 Sprint Log
                </p>

                <p className="text-gray-500 text-sm">
                  Store 10m and 20m
                  sprint PRs
                </p>
              </div>

              <span className="text-2xl">
                →
              </span>
            </div>
          </Card>
        </Link>

        <Link href="/logs/strength">
          <Card className="hover:shadow-lg transition cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-bold">
                  💪 Strength Log
                </p>

                <p className="text-gray-500 text-sm">
                  Track Bench, Squat
                  and Pullup PRs
                </p>
              </div>

              <span className="text-2xl">
                →
              </span>
            </div>
          </Card>
        </Link>

      </div>
    </main>
  );
}