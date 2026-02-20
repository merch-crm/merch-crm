import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { createInventoryAttributeType } from "../attribute-actions";;
import { playSound } from "@/lib/sounds";
import type { Category } from "../types";

const RUSSIAN_TO_LATIN_MAP: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    ' ': '_'
};

export const transliterateToSlug = (text: string) => {
    return text.toLowerCase().split('').map(char => RUSSIAN_TO_LATIN_MAP[char] || char).join('').replace(/\s+/g, '_').replace(/[^a-z0-9_-]/g, '');
};

interface UseAddAttributeTypeProps {
    categories: Category[];
}

export function useAddAttributeType({ categories }: UseAddAttributeTypeProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [label, setLabel] = useState("");
    const [slug, setSlug] = useState("");
    const [isSystem, setIsSystem] = useState(false);
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();

    const rootCategories = categories.filter(c => !c.parentId);
    const catParam = searchParams.get("cat");
    const [activeCategoryId, setActiveCategoryId] = useState<string>(catParam || (rootCategories.length > 0 ? rootCategories[0].id : "uncategorized"));

    const handleOpen = () => {
        setLabel("");
        setSlug("");
        setIsSystem(false);
        setIsSlugManuallyEdited(false);
        const currentCat = searchParams.get("cat");
        if (currentCat) {
            setActiveCategoryId(currentCat);
        } else if (rootCategories.length > 0) {
            setActiveCategoryId(rootCategories[0].id);
        }
        setIsOpen(true);
    };

    const handleCreate = async () => {
        if (!label.trim() || !slug.trim()) {
            toast("Заполните название и SLUG", "error");
            return;
        }
        setIsLoading(true);
        try {
            const catIdToSave = activeCategoryId === "uncategorized" ? undefined : activeCategoryId;
            const res = await createInventoryAttributeType({ name: label, slug, category: catIdToSave, isSystem });
            if (res.success) {
                toast("Новый раздел создан", "success");
                playSound("notification_success");
                setIsOpen(false);
                router.refresh();
            } else {
                toast(res.error || "Ошибка создания", "error");
                playSound("notification_error");
            }
        } catch {
            toast("Ошибка создания", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isOpen, setIsOpen,
        isLoading,
        label, setLabel,
        slug, setSlug,
        isSystem, setIsSystem,
        isSlugManuallyEdited, setIsSlugManuallyEdited,
        activeCategoryId, setActiveCategoryId,
        rootCategories,
        handleOpen,
        handleCreate
    };
}
