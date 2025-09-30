export interface IApplicationService<TCommand, TResult> {
    execute(command: TCommand): Promise<TResult>;
}
