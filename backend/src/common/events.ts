export class ResumeUploadedEvent {
  constructor(
    public readonly userId: string,
    public readonly rawText: string,
  ) {}
}

export class RoadmapGeneratedEvent {
  constructor(
    public readonly userId: string,
    public readonly roadmapId: string,
  ) {}
}

export class TaskCompletedEvent {
  constructor(
    public readonly userId: string,
    public readonly taskId: string,
  ) {}
}

export class RoleChangedEvent {
  constructor(
    public readonly userId: string,
    public readonly newRoleId: string,
  ) {}
}
