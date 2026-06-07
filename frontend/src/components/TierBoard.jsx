import React, { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Sortable Item Component ---
const SortableItem = ({ id, movie, isOverlay }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`relative group cursor-grab active:cursor-grabbing ${isOverlay ? 'scale-105 z-50 shadow-2xl' : ''}`}
        >
            <img
                src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                alt={movie.title}
                className="w-20 h-28 object-cover rounded-md shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200"
            />
            {/* Tooltip on hover */}
            <div className="absolute inset-x-0 bottom-0 bg-black/80 text-white text-[10px] p-1 truncate text-center opacity-0 group-hover:opacity-100 transition-opacity">
                {movie.title}
            </div>
        </div>
    );
};

// --- Tier Row Container ---
const TierRow = ({ id, tier, movies }) => {
    const { setNodeRef } = useSortable({
        id: id,
        data: {
            type: 'container',
            code: id
        }
    });

    return (
        <div className="flex mb-3 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-200 min-h-[120px]">
            <div className={`w-24 shrink-0 flex items-center justify-center text-4xl font-black italic
        ${tier === 'S' ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-[inset_-5px_0_15px_rgba(0,0,0,0.2)]' :
                    tier === 'A' ? 'bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-[inset_-5px_0_15px_rgba(0,0,0,0.15)]' :
                        tier === 'B' ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-yellow-900 shadow-[inset_-5px_0_15px_rgba(0,0,0,0.1)]' :
                            tier === 'C' ? 'bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-[inset_-5px_0_15px_rgba(0,0,0,0.15)]' : 'bg-gradient-to-br from-blue-400 to-cyan-500 text-white shadow-[inset_-5px_0_15px_rgba(0,0,0,0.15)]'}`}>
                {tier}
            </div>

            <div ref={setNodeRef} className="flex-1 p-3 flex flex-wrap gap-2 items-start bg-gray-50 dark:bg-gray-900/50 transition-colors duration-200 relative">
                <SortableContext items={movies.map(m => m.id)} strategy={rectSortingStrategy}>
                    {movies.map((movie) => (
                        <SortableItem key={movie.id} id={movie.id} movie={movie} />
                    ))}
                </SortableContext>
                {movies.length === 0 && <span className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-600/50 text-sm font-extrabold uppercase tracking-[0.3em] pointer-events-none transition-colors duration-200">Drop Here</span>}
            </div>
        </div>
    );
};

// --- Main Board ---
const TierBoard = ({ tiers, setTiers, pool, setPool }) => {
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // Prevent accidental drags
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const [activeId, setActiveId] = useState(null);

    // Helper to find which container (S, A, Pool, etc) an item is in
    const findContainer = (id) => {
        if (pool.find(m => m.id === id)) return 'pool';
        return Object.keys(tiers).find(key => tiers[key].find(m => m.id === id));
    };

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragOver = (event) => {
        const { active, over } = event;
        const overId = over?.id;

        if (!overId || active.id === overId) return;

        const activeContainer = findContainer(active.id);
        // If over a container directly (empty tier), use its ID. If over an item, find its container.
        const overContainer = (Object.keys(tiers).includes(overId) || overId === 'pool')
            ? overId
            : findContainer(overId);

        if (!activeContainer || !overContainer || activeContainer === overContainer) {
            return;
        }

        // Move logic during drag (Optimistic UI)
        // 1. Remove from source
        let item = null;
        let newPool = [...pool];
        let newTiers = { ...tiers };

        if (activeContainer === 'pool') {
            const idx = newPool.findIndex(m => m.id === active.id);
            item = newPool[idx];
            newPool.splice(idx, 1);
            setPool(newPool);
        } else {
            const idx = newTiers[activeContainer].findIndex(m => m.id === active.id);
            item = newTiers[activeContainer][idx];
            newTiers[activeContainer].splice(idx, 1);
        }

        // 2. Add to dest
        if (overContainer === 'pool') {
            newPool.push(item);
            setPool(newPool); // Add to end for now
        } else {
            newTiers[overContainer].push(item);
        }

        setTiers(newTiers);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        const activeContainer = findContainer(active.id);
        const overContainer = over ? ((Object.keys(tiers).includes(over.id) || over.id === 'pool') ? over.id : findContainer(over.id)) : null;

        if (activeContainer && overContainer && activeContainer === overContainer) {
            // Reordering within the same container
            const activeIndex = (activeContainer === 'pool' ? pool : tiers[activeContainer]).findIndex(m => m.id === active.id);
            const overIndex = (overContainer === 'pool' ? pool : tiers[overContainer]).findIndex(m => m.id === over.id);

            if (activeIndex !== overIndex) {
                if (activeContainer === 'pool') {
                    setPool((items) => arrayMove(items, activeIndex, overIndex));
                } else {
                    setTiers((t) => ({
                        ...t,
                        [activeContainer]: arrayMove(t[activeContainer], activeIndex, overIndex)
                    }));
                }
            }
        }
        setActiveId(null);
    };

    // Get active item data for overlay
    const activeItem = activeId ? (
        pool.find(m => m.id === activeId) ||
        Object.values(tiers).flat().find(m => m.id === activeId)
    ) : null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex flex-col gap-6">

                {/* Tiers Area */}
                <div className="flex flex-col gap-1">
                    {Object.entries(tiers).map(([tierKey, movies]) => (
                        <TierRow key={tierKey} id={tierKey} tier={tierKey} movies={movies} />
                    ))}
                </div>

                {/* Pool Area */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-xl transition-colors duration-200 mt-4">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-4 transition-colors duration-200">📥 Unranked Pool</h3>

                    <SortableContext id="pool" items={pool.map(m => m.id)} strategy={rectSortingStrategy}>
                        <div ref={useSortable({ id: 'pool' }).setNodeRef} className="flex flex-wrap gap-4 min-h-[150px] p-2 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 transition-colors duration-200">
                            {pool.map(movie => (
                                <SortableItem key={movie.id} id={movie.id} movie={movie} />
                            ))}
                            {pool.length === 0 && <p className="text-gray-500 dark:text-gray-400 italic w-full text-center mt-12 font-medium transition-colors duration-200">The pool is empty. Search or select a category above to find movies!</p>}
                        </div>
                    </SortableContext>
                </div>

            </div>

            <DragOverlay>
                {activeItem ? <SortableItem id={activeItem.id} movie={activeItem} isOverlay /> : null}
            </DragOverlay>
        </DndContext>
    );
};

export default TierBoard;
