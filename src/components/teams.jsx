import * as React from "react";
import { Members } from "../services/teamMemberServices";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Teams() {
  const [team, setTeam] = React.useState([]);

  React.useEffect(() => {
    if (Members && Array.isArray(Members)) {
      setTeam(Members);
    }
  }, []);

  return (
    <Card className="w-full max-w-md md:max-w-xl lg:max-w-2xl">
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
        <p className="text-sm text-muted-foreground">
          Invite your team members to collaborate.
        </p>
      </CardHeader>
      <CardContent>
        <ul role="list" className="divide-y divide-gray-200">
          {team.length === 0 ? (
            <li className="text-sm text-muted-foreground">No members found.</li>
          ) : (
            team.map(({ id, firstName, lastName, email, role, avatar }) => {
              const fullName = `${firstName} ${lastName}`;
              return (
                <li
                  key={id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-4"
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={avatar} alt={fullName} />
                      <AvatarFallback>{firstName?.[0] || "?"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{fullName}</p>
                      <p className="text-sm text-muted-foreground">{email}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium capitalize">{role}</span>
                </li>
              );
            })
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
