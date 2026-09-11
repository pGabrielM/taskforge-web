'use client'

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import TasksResponse from "@/types/tasks";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import TasksCreationModal from "../components/tasks/TaskCreateModal";
import TaskDeleteModal from "@/components/tasks/TaskDeleteModal";

export default function Home() {
  const [tasks, setTasks] = useState<TasksResponse | null>(null)
  const [error, setError] = useState<string>()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const session = useSession()

  const getTasks = useCallback(async () => {
    const res = await fetch(session.status == 'authenticated' ? '/api/user/task' : '/api/task')

    if (!res.ok) {
      setIsLoading(false)
      setTasks(null)
      return setError(res.statusText)
    }

    const data = await res.json()

    setTasks(data)
    setIsLoading(false)
  }, [session.status])

  useEffect(() => {
    getTasks()
  }, [getTasks])

  return (
    <main className="flex-1 p-6">
      <div className="flex justify-between items-center mb-6">
        {session.status == 'authenticated' ?
          <h2 className="text-xl font-bold">Your Tasks</h2>
          :
          <h2 className="text-xl font-bold">Community Tasks</h2>
        }
        <div>
          {session.status == 'authenticated' &&
            <TasksCreationModal getTasks={getTasks} />
          }
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {error &&
          <p className="text-gray-500">Failed to fetch tasks</p>
        }
        {isLoading &&
          <p className="text-gray-500">Loading</p>
        }
        {tasks?.data.meta.total == 0 &&
          <p className="text-gray-500">There are no tasks registered.</p>
        }
        {tasks?.data.data.map((task, id) => (
          <Card key={id}>
            <CardHeader>
              <CardTitle>{task.name}</CardTitle>
              <CardDescription>{task.description}</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-between items-center">
              <p className="text-gray-500">Due: {task.updated_at}</p>
              {session.status == 'authenticated' &&
                <div className="flex gap-2">
                  <Button variant="default">Edit</Button>
                  <TaskDeleteModal task={task} getTasks={getTasks} />
                </div>
              }
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  );
}
