import Image from "next/image";
import { ModeToggle } from "./mode-toggle";
import { ProfileMenu } from "./profile-menu";
import logo from "@/app/logo.svg";
import Link from "next/link";

export default function NavBar() {
    return (
        <nav
            className="relative bg-white shadow-sm dark:bg-gray-800/50 dark:shadow-none dark:after:pointer-events-none dark:after:absolute dark:after:inset-x-0 dark:after:bottom-0 dark:after:h-px dark:after:bg-white/10"
        >
            <div className="mx-auto px-2 sm:px-6 lg:px-8">
                <div className="relative flex h-16 justify-between">
                    <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                        <Link href="/" className="flex shrink-0 items-center">
                            <Image
                                alt="OpenSafetyBrief Logo"
                                src={logo}
                                className="h-8 w-auto dark:invert"
                                width={32}
                                height={32}
                            />
                        </Link>
                    </div>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                        <ModeToggle />
                        <ProfileMenu />
                    </div>
                </div>
            </div>
        </nav>
    );
}