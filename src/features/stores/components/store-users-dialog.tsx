"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import {
    IconBuildingStore,
    IconMapPin,
    IconPhone,
    IconUserPlus,
    IconUsers,
    IconGripVertical,
    IconArrowRight,
    IconArrowLeft
} from "@tabler/icons-react";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { Scrollable } from "@/components/ui/scrollable";
import { useStoreUsers, useAssignStoreUsers, useDetachStoreUser } from "../api/stores-api";
import { useUsers } from "@/features/users/api/users-api";
import type { Store } from "../types";
import type { User } from "@/types/auth";
import { DndContext, useDraggable, useDroppable, DragOverlay, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";

interface StoreUsersDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    store: Store | null;
}

const getInitials = (name: string) => {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
};

const getAvatarBg = (name: string) => {
    const colors = [
        "bg-red-50 text-red-600 border-red-100 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50",
        "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/50",
        "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50",
        "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50",
        "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50",
        "bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/50",
        "bg-violet-50 text-violet-600 border-violet-100 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-900/50",
        "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100 dark:bg-fuchsia-950/30 dark:text-fuchsia-400 dark:border-fuchsia-900/50",
        "bg-pink-50 text-pink-600 border-pink-100 dark:bg-pink-950/30 dark:text-pink-400 dark:border-pink-900/50",
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
        sum += name.charCodeAt(i);
    }
    return colors[sum % colors.length];
};

const getRoleBadge = (roles: string[]) => {
    const role = roles[0] || "kasir";
    const label = role.replace("_", " ");

    let style = "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800";
    if (role === "admin") {
        style = "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50";
    } else if (role === "manajer_toko") {
        style = "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50";
    } else if (role === "supervisor") {
        style = "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50";
    }

    return (
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold capitalize border shrink-0 leading-none ${style}`}>
            {label}
        </span>
    );
};

// --- Helper Components for Dnd Kit ---

interface DroppableContainerProps {
    id: string;
    children: React.ReactNode;
    className?: string;
}

function DroppableContainer({ id, children, className }: DroppableContainerProps) {
    const { isOver, setNodeRef } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            className={`border border-slate-200 rounded-xl h-[380px] bg-slate-50/50 transition-colors duration-200 overflow-hidden ${
                isOver ? "bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-500/10" : ""
            } ${className || ""}`}
        >
            <Scrollable className="h-full p-2">
                {children}
            </Scrollable>
        </div>
    );
}

interface UserCardProps {
    user: User;
    actionButton: React.ReactNode;
    isDragging?: boolean;
    dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}

function UserCard({ user, actionButton, isDragging, dragHandleProps }: UserCardProps) {
    return (
        <div
            className={`flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow select-none ${
                isDragging ? "opacity-30 border-dashed border-emerald-400 bg-slate-50 cursor-grabbing" : ""
            }`}
        >
            <div className="flex items-center gap-2 min-w-0">
                {/* Grip Drag Handle */}
                <button
                    type="button"
                    {...dragHandleProps}
                    className="p-1 text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing rounded hover:bg-slate-50 border-none bg-transparent flex items-center justify-center shrink-0"
                >
                    <IconGripVertical size={16} />
                </button>

                {/* Initials Avatar */}
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-extrabold shrink-0 ${getAvatarBg(user.name)}`}>
                    {getInitials(user.name)}
                </div>

                <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 truncate max-w-[110px]">
                            {user.name}
                        </span>
                        {getRoleBadge(user.roles || [])}
                    </div>
                    <span className="text-[10px] text-slate-400 truncate">
                        {user.email || user.username}
                    </span>
                </div>
            </div>

            {/* Action button */}
            <div className="shrink-0 pl-2">
                {actionButton}
            </div>
        </div>
    );
}

interface DraggableUserCardProps {
    user: User;
    actionButton: React.ReactNode;
}

function DraggableUserCard({ user, actionButton }: DraggableUserCardProps) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: user.uid,
    });

    return (
        <div ref={setNodeRef}>
            <UserCard
                user={user}
                actionButton={actionButton}
                isDragging={isDragging}
                dragHandleProps={{ ...listeners, ...attributes }}
            />
        </div>
    );
}

// --- Main Dialog ---

export function StoreUsersDialog({ open, onOpenChange, store }: StoreUsersDialogProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [searchAvailable, setSearchAvailable] = useState("");
    const [searchAssigned, setSearchAssigned] = useState("");

    const [localAssigned, setLocalAssigned] = useState<User[]>([]);
    const [localAvailable, setLocalAvailable] = useState<User[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);

    // Fetch users for the current store
    const { data: storeUsers, isLoading: isLoadingStoreUsers } = useStoreUsers(store?.uid ?? "");

    // Fetch all users (across stores)
    const { data: usersRes, isLoading: isLoadingAllUsers } = useUsers({ per_page: 1000, all_stores: true });

    const assignMutation = useAssignStoreUsers();
    const detachMutation = useDetachStoreUser();

    // Prevent hydration mismatch
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMounted(true);
    }, []);

    // Sync state from server queries during render (prevents cascading renders and satisfies ESLint)
    const [prevStoreUsers, setPrevStoreUsers] = useState<User[] | undefined>(undefined);
    const [prevAllUsers, setPrevAllUsers] = useState<User[] | undefined>(undefined);

    if (storeUsers !== prevStoreUsers || usersRes?.data !== prevAllUsers) {
        setPrevStoreUsers(storeUsers);
        setPrevAllUsers(usersRes?.data);

        if (storeUsers) {
            setLocalAssigned(storeUsers);
        } else {
            setLocalAssigned([]);
        }

        const allUsers = usersRes?.data;
        if (allUsers && storeUsers) {
            const available = allUsers.filter(
                (user) => !storeUsers.some((storeUser) => storeUser.uid === user.uid)
            );
            setLocalAvailable(available);
        } else if (allUsers) {
            setLocalAvailable(allUsers);
        } else {
            setLocalAvailable([]);
        }
    }

    // Handle Transfer Operations (Optimistic)
    const handleMoveToAssigned = async (user: User) => {
        // Optimistic UI updates
        setLocalAvailable((prev) => prev.filter((u) => u.uid !== user.uid));
        setLocalAssigned((prev) => [...prev, user]);

        try {
            await assignMutation.mutateAsync({ storeUid: store!.uid, user_uids: [user.uid] });
            toast.success(`Akses berhasil diberikan untuk ${user.name}`);
        } catch {
            // Revert state on error
            setLocalAssigned((prev) => prev.filter((u) => u.uid !== user.uid));
            setLocalAvailable((prev) => [...prev, user]);
            toast.error("Gagal menambahkan user ke toko");
        }
    };

    const handleMoveToAvailable = async (user: User) => {
        // Optimistic UI updates
        setLocalAssigned((prev) => prev.filter((u) => u.uid !== user.uid));
        setLocalAvailable((prev) => [...prev, user]);

        try {
            await detachMutation.mutateAsync({ storeUid: store!.uid, userUid: user.uid });
            toast.success(`Akses dicabut untuk ${user.name}`);
        } catch {
            // Revert state on error
            setLocalAvailable((prev) => prev.filter((u) => u.uid !== user.uid));
            setLocalAssigned((prev) => [...prev, user]);
            toast.error("Gagal mencabut akses user");
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragCancel = () => {
        setActiveId(null);
    };

    // Dnd kit Drag End Event Handler
    const handleDragEnd = (event: DragEndEvent) => {
        setActiveId(null);
        const { active, over } = event;

        if (!over) {
            return;
        }

        const userId = active.id as string;
        const destination = over.id as string;

        const userInAvailable = localAvailable.find((u) => u.uid === userId);
        const userInAssigned = localAssigned.find((u) => u.uid === userId);

        if (destination === "assigned" && userInAvailable) {
            handleMoveToAssigned(userInAvailable);
        } else if (destination === "available" && userInAssigned) {
            handleMoveToAvailable(userInAssigned);
        }
    };

    // Filters based on search queries
    const filteredAvailable = localAvailable.filter((user) =>
        user.name.toLowerCase().includes(searchAvailable.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(searchAvailable.toLowerCase())) ||
        user.username.toLowerCase().includes(searchAvailable.toLowerCase())
    );

    const filteredAssigned = localAssigned.filter((user) =>
        user.name.toLowerCase().includes(searchAssigned.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(searchAssigned.toLowerCase())) ||
        user.username.toLowerCase().includes(searchAssigned.toLowerCase())
    );

    if (!isMounted) return null;

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <div className="flex items-center gap-2">
                    <IconUsers className="text-emerald-500" size={20} />
                    <span>Kelola Akses Pengguna</span>
                </div>
            }
            className="!max-w-4xl w-full"
            scrollable
        >
            <div className="space-y-6">
                {/* Top Section: Store Info Card */}
                {store && (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200">
                                    <IconBuildingStore size={18} />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="font-bold text-sm text-slate-900 truncate">
                                        {store.nama}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                        {store.is_central ? "Cabang Pusat" : "Cabang Ritel"}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-4 text-xs text-slate-500 sm:border-l sm:border-slate-200/80 sm:pl-4">
                                <div className="flex items-start gap-1.5">
                                    <IconMapPin size={14} className="mt-0.5 text-slate-400 shrink-0" />
                                    <span className="line-clamp-1 max-w-[250px]">{store.alamat || "Alamat belum diatur"}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <IconPhone size={14} className="text-slate-400 shrink-0" />
                                    <span>{store.telepon || "No. Telepon belum diatur"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bottom Section: DndContext Split Panels */}
                <DndContext
                    onDragStart={handleDragStart}
                    onDragCancel={handleDragCancel}
                    onDragEnd={handleDragEnd}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Left Column: Available Users */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <IconUserPlus size={16} className="text-slate-400" />
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                        User Tersedia
                                    </h4>
                                </div>
                                <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-full">
                                    {filteredAvailable.length} user
                                </span>
                            </div>

                            <input
                                type="text"
                                placeholder="Cari user tersedia..."
                                value={searchAvailable}
                                onChange={(e) => setSearchAvailable(e.target.value)}
                                className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder-slate-400"
                            />

                            <DroppableContainer id="available">
                                {isLoadingAllUsers || isLoadingStoreUsers ? (
                                    <div className="p-8 text-center text-xs text-slate-400">Memuat data user...</div>
                                ) : filteredAvailable.length === 0 ? (
                                    <div className="p-8 text-center text-xs text-slate-400">
                                        {searchAvailable ? "Tidak ada user yang cocok" : "Tidak ada user tersedia"}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {filteredAvailable.map((user) => (
                                            <DraggableUserCard
                                                key={user.uid}
                                                user={user}
                                                actionButton={
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleMoveToAssigned(user)}
                                                        className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer rounded-lg flex items-center justify-center border-none"
                                                    >
                                                        <IconArrowRight size={16} />
                                                    </Button>
                                                }
                                            />
                                        ))}
                                    </div>
                                )}
                            </DroppableContainer>
                        </div>

                        {/* Right Column: Assigned Users */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <IconUsers size={16} className="text-emerald-500" />
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                        User Terdaftar
                                    </h4>
                                </div>
                                <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-full">
                                    {filteredAssigned.length} user
                                </span>
                            </div>

                            <input
                                type="text"
                                placeholder="Cari user terdaftar..."
                                value={searchAssigned}
                                onChange={(e) => setSearchAssigned(e.target.value)}
                                className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder-slate-400"
                            />

                            <DroppableContainer id="assigned">
                                {isLoadingAllUsers || isLoadingStoreUsers ? (
                                    <div className="p-8 text-center text-xs text-slate-400">Memuat data user...</div>
                                ) : filteredAssigned.length === 0 ? (
                                    <div className="p-8 text-center text-xs text-slate-400">
                                        {searchAssigned ? "Tidak ada user yang cocok" : "Belum ada user di toko ini"}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {filteredAssigned.map((user) => (
                                            <DraggableUserCard
                                                key={user.uid}
                                                user={user}
                                                actionButton={
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleMoveToAvailable(user)}
                                                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer rounded-lg flex items-center justify-center border-none"
                                                    >
                                                        <IconArrowLeft size={16} />
                                                    </Button>
                                                }
                                            />
                                        ))}
                                    </div>
                                )}
                            </DroppableContainer>
                        </div>

                    </div>

                    {createPortal(
                        <DragOverlay>
                            {activeId ? (
                                <UserCard
                                    user={
                                        localAvailable.find((u) => u.uid === activeId) ||
                                        localAssigned.find((u) => u.uid === activeId)!
                                    }
                                    actionButton={null}
                                />
                            ) : null}
                        </DragOverlay>,
                        document.body
                    )}
                </DndContext>
            </div>
        </BaseDialog>
    );
}