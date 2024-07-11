declare global {
    interface String {
        helloword(): string;
    }

    function loadMpPackage(packageName: string, successCallback?: Function, failCallback?: Function)

    function loadMpPackageModule(modulePath: string): any
}

export {};
