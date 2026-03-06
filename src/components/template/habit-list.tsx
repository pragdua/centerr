"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { HabitItem } from "./habit-item";
import { HabitForm } from "./habit-form";
import { createClient } from "@/lib/supabase/client";
import { useHaptics } from "@/lib/haptics";
import type { Habit, FrequencyType } from "@/types/database";

interface HabitListProps {
  initialHabits: Habit[];
  userId: string;
}

export function HabitList({ initialHabits, userId }: HabitListProps) {
  const [habits, setHabits] = useState(initialHabits);
  const supabase = createClient();
  const haptics = useHaptics();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      haptics.drag();

      const oldIndex = habits.findIndex((h) => h.id === active.id);
      const newIndex = habits.findIndex((h) => h.id === over.id);

      const reordered = [...habits];
      const [moved] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, moved);

      // Update sort_order
      const updated = reordered.map((h, i) => ({ ...h, sort_order: i }));
      setHabits(updated);

      // Persist
      await Promise.all(
        updated.map(({ id, sort_order }) =>
          supabase.from("habits").update({ sort_order }).eq("id", id)
        )
      );
    },
    [habits, supabase, haptics]
  );

  const handleAdd = useCallback(
    async (newHabit: {
      name: string;
      emoji: string;
      frequency_type: FrequencyType;
      frequency_days: number[];
    }) => {
      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("habits")
        .insert({
          user_id: userId,
          name: newHabit.name,
          emoji: newHabit.emoji || null,
          sort_order: habits.length,
          frequency_type: newHabit.frequency_type,
          frequency_days:
            newHabit.frequency_type === "specific_days"
              ? newHabit.frequency_days
              : null,
          frequency_start_date:
            newHabit.frequency_type === "alternate" ? today : null,
        })
        .select()
        .single();

      if (!error && data) {
        setHabits((prev) => [...prev, data as Habit]);
      }
    },
    [supabase, userId, habits.length]
  );

  const handleUpdate = useCallback(
    async (
      id: string,
      updates: {
        name?: string;
        emoji?: string | null;
        frequency_type?: FrequencyType;
        frequency_days?: number[];
      }
    ) => {
      const today = new Date().toISOString().split("T")[0];

      const dbUpdates: Record<string, unknown> = { ...updates };
      if (updates.frequency_type === "alternate") {
        dbUpdates.frequency_start_date = today;
        dbUpdates.frequency_days = null;
      } else if (updates.frequency_type === "daily") {
        dbUpdates.frequency_days = null;
        dbUpdates.frequency_start_date = null;
      }

      const { error } = await supabase
        .from("habits")
        .update(dbUpdates)
        .eq("id", id);

      if (!error) {
        setHabits((prev) =>
          prev.map((h) =>
            h.id === id ? { ...h, ...(dbUpdates as Partial<Habit>) } : h
          )
        );
      }
    },
    [supabase]
  );

  const handleDeactivate = useCallback(
    async (id: string) => {
      const { error } = await supabase
        .from("habits")
        .update({ is_active: false })
        .eq("id", id);

      if (!error) {
        setHabits((prev) => prev.filter((h) => h.id !== id));
      }
    },
    [supabase]
  );

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Template</h1>
        <p className="text-sm text-muted mt-1">
          Configure your daily habits
        </p>
      </div>

      {/* Add new habit */}
      <HabitForm onAdd={handleAdd} />

      {/* Existing habits */}
      <div className="mt-5 flex flex-col gap-3">
        {habits.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">✨</p>
            <p className="text-sm text-muted">
              Add your first habit above to get started.
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext
              items={habits.map((h) => h.id)}
              strategy={verticalListSortingStrategy}
            >
              {habits.map((habit) => (
                <HabitItem
                  key={habit.id}
                  habit={habit}
                  onUpdate={handleUpdate}
                  onDeactivate={handleDeactivate}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
