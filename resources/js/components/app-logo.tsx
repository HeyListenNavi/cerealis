import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-[#658c2d] text-sidebar-primary-foreground">
                <AppLogoIcon className="size-5 fill-white text-white dark:text-black" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="truncate leading-tight font-semibold">
                    Cerealis
                </span>
            </div>
        </>
    );
}
