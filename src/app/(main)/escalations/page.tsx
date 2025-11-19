
"use client"

import { useState } from "react"
import { columns } from "@/components/dashboard/columns"
import { EscalationsDataTable } from "@/components/dashboard/escalations-data-table"
import { EscalationDetails } from "@/components/dashboard/escalation-details"
import { UpdateStatusDialog } from "@/components/dashboard/update-status-dialog"
import { AssignTeamMemberDialog } from "@/components/dashboard/assign-team-member-dialog"
import { useEscalationContext } from "@/context/escalation-context"
import type { Escalation } from "@/types"

export default function EscalationsPage() {
  const { escalations, loading } = useEscalationContext();
  const [selectedEscalation, setSelectedEscalation] = useState<Escalation | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false);
  const [isAssignTeamMemberOpen, setIsAssignTeamMemberOpen] = useState(false);

  const handleViewDetails = (escalation: Escalation) => {
    setSelectedEscalation(escalation);
    setIsDetailsOpen(true);
  };

  const handleUpdateStatus = (escalation: Escalation) => {
    setSelectedEscalation(escalation);
    setIsUpdateStatusOpen(true);
  }
  
  const handleAssignTeamMember = (escalation: Escalation) => {
    setSelectedEscalation(escalation);
    setIsAssignTeamMemberOpen(true);
  }

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedEscalation(null);
  };

  const handleCloseUpdateStatus = () => {
    setIsUpdateStatusOpen(false);
    setSelectedEscalation(null);
  }

  const handleCloseAssignTeamMember = () => {
    setIsAssignTeamMemberOpen(false);
    setSelectedEscalation(null);
  }

  return (
    <div className="h-full w-full">
      <EscalationsDataTable
        columns={columns({ 
          onViewDetails: handleViewDetails,
          onUpdateStatus: handleUpdateStatus,
          onAssignTeamMember: handleAssignTeamMember,
        })}
        data={escalations}
        loading={loading}
      />
      <EscalationDetails
        escalation={selectedEscalation}
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
      />
      <UpdateStatusDialog
        escalation={selectedEscalation}
        isOpen={isUpdateStatusOpen}
        onClose={handleCloseUpdateStatus}
      />
      <AssignTeamMemberDialog
        escalation={selectedEscalation}
        isOpen={isAssignTeamMemberOpen}
        onClose={handleCloseAssignTeamMember}
      />
    </div>
  )
}
