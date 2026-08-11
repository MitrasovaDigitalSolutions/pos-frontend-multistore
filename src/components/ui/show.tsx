import React from "react";

interface ShowProps {
    children: React.ReactNode;
}

interface ShowWhenProps {
    isTrue: boolean;
    children: React.ReactNode;
}

interface ShowElseProps {
    children: React.ReactNode;
}

export function Show({ children }: ShowProps) {
    let when: React.ReactNode = null;
    let otherwise: React.ReactNode = null;

    React.Children.forEach(children, (child) => {
        if (React.isValidElement(child)) {
            const childType = child.type;
            if (childType === ShowWhen || (childType as unknown as Record<string, unknown>)?.displayName === "ShowWhen") {
                const props = child.props as ShowWhenProps;
                if (props.isTrue && !when) {
                    when = props.children;
                }
            } else if (childType === ShowElse || (childType as unknown as Record<string, unknown>)?.displayName === "ShowElse") {
                const props = child.props as ShowElseProps;
                otherwise = props.children;
            }
        }
    });

    return (when ?? otherwise ?? null) as React.ReactElement | null;
}

function ShowWhen({ isTrue, children }: ShowWhenProps) {
    return isTrue ? <>{children}</> : null;
}
ShowWhen.displayName = "ShowWhen";

function ShowElse({ children }: ShowElseProps) {
    return <>{children}</>;
}
ShowElse.displayName = "ShowElse";

Show.When = ShowWhen;
Show.Else = ShowElse;
