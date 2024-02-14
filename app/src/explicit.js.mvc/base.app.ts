export abstract class BaseApp {
    public abstract RegisterControllers(): void;
    public abstract RegisterContainers(): void;
	public inti()
	{
		this.RegisterContainers();
		this.RegisterControllers();
	}
}
