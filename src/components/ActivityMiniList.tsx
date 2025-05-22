import React from 'react';

interface Item {
  id: number;
  exercise_type: string;
  created_at: string;
  user: { id: number; name: string };
}

export default function ActivityMiniList({ list }: { list: Item[] }) {
  return (
    <div className="space-y-4">
      {list.map(item => (
        <div key={item.id} className="flex items-center">
          <div className="h-9 w-9 rounded-full bg-sanjer-blue flex items-center justify-center text-white mr-3">
            {item.user.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium">
              <span className="font-bold">{item.user.name}</span>{' '}
              registró{' '}
              <span className="font-semibold">{item.exercise_type}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(item.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
