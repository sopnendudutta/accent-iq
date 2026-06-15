import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

import {
    getPronunciationFavorites,
    getPronunciationHistory,
} from "../services/api";
import { getUserPreferences } from "../utils/preferences";

import type { AuthUser } from "../types/auth";
import type {
    PronunciationFavoriteItem,
    PronunciationHistoryItem,
} from "../types/pronunciation";
import type { PracticeGoal } from "../utils/preferences";

type ProgressProps = {
    user: AuthUser | null;
    isAuthLoading: boolean;
};

type MessageType = "info" | "error" | "success";

type WeeklyPracticeDay = {
    key: string;
    label: string;
    count: number;
};

type PracticeStreakSummary = {
    currentStreakDays: number;
    bestStreakDays: number;
    practiceDayCount: number;
    hasPracticedToday: boolean;
};

type AccentPracticeRow = {
    accent: string;
    label: string;
    count: number;
};

type PracticeRecommendation = {
    id: string;
    title: string;
    reason: string;
    actionLabel: string;
    to: string;
    suggestedWords?: string[];
    suggestedAccent?: string;
};

type PracticeRecommendationInput = {
    history: PronunciationHistoryItem[];
    favorites: PronunciationFavoriteItem[];
    accentRows: AccentPracticeRow[];
    mostPracticedAccent?: AccentPracticeRow;
    currentStreakDays: number;
    bestStreakDays: number;
    hasPracticedToday: boolean;
    practiceGoal: PracticeGoal;
};

const accentLabels: Record<string, string> = {
    US: "American English",
    UK: "British English",
    AUSTRALIAN: "Australian English",
    INDIAN: "Indian English",
    CANADIAN: "Canadian English",
    IRISH: "Irish English",
    NEW_ZEALAND: "New Zealand English",
    SOUTH_AFRICAN: "South African English",
};

const accentOrder = [
    "US",
    "UK",
    "AUSTRALIAN",
    "INDIAN",
    "CANADIAN",
    "IRISH",
    "NEW_ZEALAND",
    "SOUTH_AFRICAN",
];

const pronunciationRoute = "/pronunciation";
const starterPracticeWords = ["comfortable", "schedule", "water"];

function normalizePracticeText(text: string) {
    return text.trim().toLowerCase();
}

function getDateKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getStartOfLocalDay(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getLocalDateFromKey(dateKey: string) {
    const [year, month, day] = dateKey.split("-").map(Number);

    return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number) {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + days);
    return nextDate;
}

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function formatRelativePracticeDate(dateString: string) {
    const date = getStartOfLocalDay(new Date(dateString));
    const today = getStartOfLocalDay(new Date());
    const dayDifference = Math.round(
        (today.getTime() - date.getTime()) / 86_400_000
    );

    if (dayDifference === 0) {
        return "Today";
    }

    if (dayDifference === 1) {
        return "Yesterday";
    }

    return formatDate(dateString);
}

function getUniquePracticeDayKeys(history: PronunciationHistoryItem[]) {
    return Array.from(
        new Set(history.map((item) => getDateKey(new Date(item.createdAt))))
    ).sort();
}

function calculateCurrentStreakFromDays(dayKeys: string[]) {
    if (dayKeys.length === 0) {
        return 0;
    }

    const practiceDays = new Set(dayKeys);

    const today = getStartOfLocalDay(new Date());
    const todayKey = getDateKey(today);
    const yesterday = addDays(today, -1);
    const yesterdayKey = getDateKey(yesterday);

    let cursor = practiceDays.has(todayKey) ? today : yesterday;

    if (!practiceDays.has(getDateKey(cursor))) {
        return 0;
    }

    let streak = 0;

    while (practiceDays.has(getDateKey(cursor))) {
        streak += 1;
        cursor = addDays(cursor, -1);
    }

    if (!practiceDays.has(todayKey) && !practiceDays.has(yesterdayKey)) {
        return 0;
    }

    return streak;
}

function calculateBestStreakFromDays(dayKeys: string[]) {
    if (dayKeys.length === 0) {
        return 0;
    }

    let bestStreak = 1;
    let currentStreak = 1;

    for (let index = 1; index < dayKeys.length; index += 1) {
        const previousDay = getLocalDateFromKey(dayKeys[index - 1]);
        const currentDay = getLocalDateFromKey(dayKeys[index]);
        const dayDifference = Math.round(
            (currentDay.getTime() - previousDay.getTime()) / 86_400_000
        );

        if (dayDifference === 1) {
            currentStreak += 1;
            bestStreak = Math.max(bestStreak, currentStreak);
            continue;
        }

        if (dayDifference > 1) {
            currentStreak = 1;
        }
    }

    return bestStreak;
}

function getPracticeStreakSummary(
    history: PronunciationHistoryItem[]
): PracticeStreakSummary {
    const dayKeys = getUniquePracticeDayKeys(history);

    return {
        currentStreakDays: calculateCurrentStreakFromDays(dayKeys),
        bestStreakDays: calculateBestStreakFromDays(dayKeys),
        practiceDayCount: dayKeys.length,
        hasPracticedToday: dayKeys.includes(getDateKey(new Date())),
    };
}

function formatDayLabel(count: number) {
    return count === 1 ? "day" : "days";
}

function getStreakHeadline(streakSummary: PracticeStreakSummary) {
    if (streakSummary.currentStreakDays > 1) {
        return `You have practiced for ${streakSummary.currentStreakDays} saved days in a row.`;
    }

    if (streakSummary.currentStreakDays === 1) {
        return "Your saved practice streak has started.";
    }

    if (streakSummary.practiceDayCount > 0) {
        return "Practice today to rebuild your streak.";
    }

    return "Practice a word to start your streak.";
}

function getTodayPracticeMessage(streakSummary: PracticeStreakSummary) {
    if (streakSummary.hasPracticedToday) {
        return "Today already counts.";
    }

    if (streakSummary.currentStreakDays > 0) {
        return "Save one check to keep it going.";
    }

    return "Save one check to start again.";
}

function getWeeklyPractice(history: PronunciationHistoryItem[]) {
    const today = getStartOfLocalDay(new Date());
    const startDate = addDays(today, -6);
    const counts = new Map<string, number>();

    history.forEach((item) => {
        const itemDate = getStartOfLocalDay(new Date(item.createdAt));

        if (itemDate < startDate || itemDate > today) {
            return;
        }

        const key = getDateKey(itemDate);
        counts.set(key, (counts.get(key) || 0) + 1);
    });

    return Array.from({ length: 7 }, (_, index): WeeklyPracticeDay => {
        const date = addDays(startDate, index);
        const key = getDateKey(date);

        return {
            key,
            label: date.toLocaleDateString(undefined, { weekday: "short" }),
            count: counts.get(key) || 0,
        };
    });
}

function getAccentLabel(accent: string) {
    return accentLabels[accent] || accent;
}

function getRecommendationLimit(practiceGoal: PracticeGoal) {
    if (practiceGoal === "INTENSIVE") {
        return 4;
    }

    if (practiceGoal === "REGULAR") {
        return 3;
    }

    return 2;
}

function getUniquePracticeTexts<T extends { text: string }>(
    items: T[],
    limit: number
) {
    const seen = new Set<string>();
    const texts: string[] = [];

    for (const item of items) {
        const normalizedText = normalizePracticeText(item.text);

        if (!normalizedText || seen.has(normalizedText)) {
            continue;
        }

        seen.add(normalizedText);
        texts.push(item.text.trim());

        if (texts.length === limit) {
            break;
        }
    }

    return texts;
}

function getStarterRecommendations(): PracticeRecommendation[] {
    return [
        {
            id: "starter-words",
            title: "Start with three comfortable words.",
            reason:
                "These starter words make syllables, stress, and accent differences easy to notice.",
            actionLabel: "Start practicing",
            to: pronunciationRoute,
            suggestedWords: starterPracticeWords,
            suggestedAccent: getAccentLabel("US"),
        },
        {
            id: "starter-accent",
            title: "Try one accent comparison.",
            reason:
                "Use one familiar word in another accent to compare rhythm and vowel choices.",
            actionLabel: "Compare accents",
            to: pronunciationRoute,
            suggestedWords: ["schedule"],
            suggestedAccent: getAccentLabel("UK"),
        },
    ];
}

function getPracticeRecommendations(
    input: PracticeRecommendationInput
): PracticeRecommendation[] {
    const limit = getRecommendationLimit(input.practiceGoal);

    if (input.history.length === 0) {
        return getStarterRecommendations().slice(0, limit);
    }

    const recommendations: PracticeRecommendation[] = [];
    const recentWords = getUniquePracticeTexts(input.history, 3);
    const favoriteWords = getUniquePracticeTexts(input.favorites, 3);

    if (input.currentStreakDays > 0 && !input.hasPracticedToday) {
        recommendations.push({
            id: "streak-continuation",
            title: "Save one practice check today.",
            reason:
                "Based on your saved practice rhythm. Streaks count practice days, not pronunciation scores.",
            actionLabel: "Keep streak active",
            to: pronunciationRoute,
            suggestedWords: recentWords.slice(0, 2),
        });
    } else if (input.currentStreakDays === 0 && input.bestStreakDays > 0) {
        recommendations.push({
            id: "streak-restart",
            title: "Restart your streak with one short word.",
            reason:
                "Based on your saved practice history. One logged-in check starts a fresh practice day.",
            actionLabel: "Restart practice",
            to: pronunciationRoute,
            suggestedWords: recentWords.slice(0, 2),
        });
    }

    if (favoriteWords.length > 0) {
        recommendations.push({
            id: "favorite-review",
            title: "Review three saved favorites today.",
            reason:
                "Based on saved favorites. Repeating them is a steady way to build familiarity.",
            actionLabel: "Review favorites",
            to: pronunciationRoute,
            suggestedWords: favoriteWords,
        });
    }

    const unusedAccent = input.accentRows.find((row) => row.count === 0);
    const comparisonAccent =
        unusedAccent ||
        input.accentRows.find(
            (row) => row.accent !== input.mostPracticedAccent?.accent
        );

    if (comparisonAccent) {
        recommendations.push({
            id: "accent-variety",
            title: `Try ${comparisonAccent.label} for comparison.`,
            reason: input.mostPracticedAccent
                ? `Based on accent coverage. You have practiced ${input.mostPracticedAccent.label} most often.`
                : "Based on accent coverage. Trying another accent helps you compare patterns.",
            actionLabel: "Try accent",
            to: pronunciationRoute,
            suggestedWords: recentWords.slice(0, 1).length
                ? recentWords.slice(0, 1)
                : ["schedule"],
            suggestedAccent: comparisonAccent.label,
        });
    }

    if (recentWords.length > 0) {
        recommendations.push({
            id: "recent-follow-up",
            title: "Repeat one recent practice word.",
            reason:
                "Based on recent saved practice. Revisiting a familiar word keeps the guidance easy to compare.",
            actionLabel: "Repeat a word",
            to: pronunciationRoute,
            suggestedWords: recentWords,
        });
    }

    if (input.history.length > 0 && input.history.length < 5) {
        recommendations.push({
            id: "first-five",
            title: "Build your first five saved practice items.",
            reason:
                "Based on saved practice count. A few more checks make the dashboard more useful.",
            actionLabel: "Add practice",
            to: pronunciationRoute,
            suggestedWords: starterPracticeWords,
        });
    }

    return recommendations.slice(0, limit);
}

function RecommendedPracticeSection({
    recommendations,
    note,
    sourceLabel = "Saved-data suggestion",
}: {
    recommendations: PracticeRecommendation[];
    note: string;
    sourceLabel?: string;
}) {
    return (
        <section
            className="progress-recommendations"
            aria-labelledby="progress-recommendations-title"
        >
            <div className="progress-recommendations-header">
                <div>
                    <span className="result-label">Recommended practice</span>
                    <h2 id="progress-recommendations-title">What to practice next</h2>
                </div>
                <p>{note}</p>
            </div>

            <div className="recommendation-grid">
                {recommendations.map((recommendation) => (
                    <article key={recommendation.id} className="recommendation-card">
                        <div>
                            <span className="recommendation-source">
                                {sourceLabel}
                            </span>
                            <h3>{recommendation.title}</h3>
                            <p>{recommendation.reason}</p>
                        </div>

                        {(Boolean(recommendation.suggestedAccent) ||
                            Boolean(recommendation.suggestedWords?.length)) && (
                            <div className="recommendation-card-meta">
                                {recommendation.suggestedAccent && (
                                    <span className="recommendation-chip">
                                        {recommendation.suggestedAccent}
                                    </span>
                                )}

                                {recommendation.suggestedWords?.map((word) => (
                                    <span key={word} className="recommendation-chip">
                                        {word}
                                    </span>
                                ))}
                            </div>
                        )}

                        <Link
                            className="secondary-cta recommendation-action"
                            to={recommendation.to}
                        >
                            {recommendation.actionLabel}
                        </Link>
                    </article>
                ))}
            </div>
        </section>
    );
}

function Progress({ user, isAuthLoading }: ProgressProps) {
    const [history, setHistory] = useState<PronunciationHistoryItem[]>([]);
    const [favorites, setFavorites] = useState<PronunciationFavoriteItem[]>([]);
    const [isProgressLoading, setIsProgressLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<MessageType>("info");
    const userPreferences = useMemo(() => getUserPreferences(), []);
    const guestRecommendations = useMemo(() => getStarterRecommendations(), []);

    const loadProgressData = useCallback(async () => {
        if (!user) {
            setHistory([]);
            setFavorites([]);
            return;
        }

        try {
            setIsProgressLoading(true);
            setMessageType("info");
            setMessage("Loading your saved practice progress...");

            const [historyResponse, favoritesResponse] = await Promise.all([
                getPronunciationHistory(),
                getPronunciationFavorites(),
            ]);

            setHistory(historyResponse.data);
            setFavorites(favoritesResponse.data);
            setMessageType("success");
            setMessage("Progress updated from your saved practice.");
        } catch (error) {
            console.error(error);
            setHistory([]);
            setFavorites([]);
            setMessageType("error");

            if (error instanceof Error) {
                setMessage(error.message);
            } else {
                setMessage("Could not load progress right now.");
            }
        } finally {
            setIsProgressLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (isAuthLoading) {
            return;
        }

        const progressLoadId = window.setTimeout(() => {
            if (!user) {
                setHistory([]);
                setFavorites([]);
                setMessage("");
                return;
            }

            void loadProgressData();
        }, 0);

        return () => window.clearTimeout(progressLoadId);
    }, [isAuthLoading, user, loadProgressData]);

    const progressSummary = useMemo(() => {
        const sortedHistory = [...history].sort(
            (left, right) =>
                new Date(right.createdAt).getTime() -
                new Date(left.createdAt).getTime()
        );

        const sortedFavorites = [...favorites].sort(
            (left, right) =>
                new Date(right.createdAt).getTime() -
                new Date(left.createdAt).getTime()
        );

        const uniquePracticeItems = new Set(
            history.map((item) => normalizePracticeText(item.text))
        );

        const accentCounts = new Map<string, number>();

        history.forEach((item) => {
            accentCounts.set(item.accent, (accentCounts.get(item.accent) || 0) + 1);
        });

        const accentRows = accentOrder.map((accent) => ({
            accent,
            label: getAccentLabel(accent),
            count: accentCounts.get(accent) || 0,
        }));

        const practicedAccentRows = accentRows.filter((row) => row.count > 0);
        const mostPracticedAccent = practicedAccentRows.sort(
            (left, right) => right.count - left.count
        )[0];

        const weeklyPractice = getWeeklyPractice(history);
        const practiceThisWeek = weeklyPractice.reduce(
            (total, day) => total + day.count,
            0
        );
        const streakSummary = getPracticeStreakSummary(history);

        return {
            totalPracticeItems: history.length,
            uniquePracticeItems: uniquePracticeItems.size,
            favoriteCount: favorites.length,
            accentCount: practicedAccentRows.length,
            mostPracticedAccent,
            currentStreakDays: streakSummary.currentStreakDays,
            bestStreakDays: streakSummary.bestStreakDays,
            practiceDayCount: streakSummary.practiceDayCount,
            hasPracticedToday: streakSummary.hasPracticedToday,
            streakHeadline: getStreakHeadline(streakSummary),
            todayPracticeMessage: getTodayPracticeMessage(streakSummary),
            lastPracticeDate: sortedHistory[0]?.createdAt || null,
            practiceThisWeek,
            weeklyPractice,
            accentRows,
            recentPractice: sortedHistory.slice(0, 5),
            reviewQueue: sortedFavorites.slice(0, 4),
            recommendations: getPracticeRecommendations({
                history: sortedHistory,
                favorites: sortedFavorites,
                accentRows,
                mostPracticedAccent,
                currentStreakDays: streakSummary.currentStreakDays,
                bestStreakDays: streakSummary.bestStreakDays,
                hasPracticedToday: streakSummary.hasPracticedToday,
                practiceGoal: userPreferences.practiceGoal,
            }),
        };
    }, [history, favorites, userPreferences.practiceGoal]);

    const hasHistory = progressSummary.totalPracticeItems > 0;
    const maxWeeklyCount = Math.max(
        1,
        ...progressSummary.weeklyPractice.map((day) => day.count)
    );

    if (isAuthLoading) {
        return (
            <section className="page progress-page">
                <div className="progress-hero">
                    <h1>Your practice progress</h1>
                    <p>Checking your account before loading saved practice.</p>
                </div>
            </section>
        );
    }

    if (!user) {
        return (
            <section className="page progress-page">
                <div className="progress-hero">
                    <h1>Your practice progress starts after login.</h1>
                    <p>
                        AccentIQ can summarize saved practice, favorite review words,
                        accent coverage, and streaks once your work is connected to an
                        account.
                    </p>

                    <div className="progress-actions">
                        <Link className="primary-cta" to="/login">
                            Login
                        </Link>
                        <Link className="secondary-cta" to="/register">
                            Create account
                        </Link>
                    </div>
                </div>

                <div className="progress-layout">
                    <RecommendedPracticeSection
                        recommendations={guestRecommendations}
                        sourceLabel="Starter suggestion"
                        note="Practice as a guest, or login to save history and receive recommendations based on your own practice."
                    />

                    <div className="progress-empty-panel">
                        <span className="result-label">Guest view</span>
                        <h2>Progress uses saved practice only.</h2>
                        <p>
                            Guest pronunciation checks still work, but they are not saved
                            into your practice timeline. Login to build a progress history.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="page progress-page">
            <div className="progress-hero">
                <div>
                    <h1>Your practice progress</h1>
                    <p>
                        A calm summary of saved pronunciation practice, review words,
                        streaks, and accent coverage. This dashboard tracks activity, not
                        audio accuracy.
                    </p>
                </div>

                <div className="progress-hero-note">
                    <span className="result-label">Signed in</span>
                    <strong>{user.name || user.email}</strong>
                    <p>
                        Showing saved practice only. Voice scoring and pronunciation
                        accuracy are planned later.
                    </p>
                    <button
                        type="button"
                        className="secondary-button"
                        onClick={loadProgressData}
                        disabled={isProgressLoading}
                    >
                        {isProgressLoading ? "Refreshing..." : "Refresh progress"}
                    </button>
                </div>
            </div>

            <div className="progress-layout">
                {message && (
                    <div className={`inline-message inline-message-${messageType}`}>
                        <strong>Progress:</strong>
                        <p>{message}</p>
                    </div>
                )}

                {!hasHistory && !isProgressLoading && (
                    <div className="progress-empty-panel">
                        <span className="result-label">No saved practice yet</span>
                        <h2>Practice a word to start your streak.</h2>
                        <p>
                            Analyze a pronunciation while logged in and AccentIQ will build
                            your streak and progress summary from saved history.
                        </p>
                        <Link className="primary-cta" to="/pronunciation">
                            Start practicing
                        </Link>
                    </div>
                )}

                <RecommendedPracticeSection
                    recommendations={progressSummary.recommendations}
                    note="These suggestions use saved practice activity, favorites, streaks, and accent coverage. They do not score your voice."
                />

                <div className="progress-summary-strip">
                    <div className="progress-summary-item">
                        <span>Saved practice</span>
                        <strong>{progressSummary.totalPracticeItems}</strong>
                        <p>Total logged-in pronunciation checks.</p>
                    </div>

                    <div className="progress-summary-item">
                        <span>Unique words</span>
                        <strong>{progressSummary.uniquePracticeItems}</strong>
                        <p>Distinct words or phrases practiced.</p>
                    </div>

                    <div className="progress-summary-item">
                        <span>Practice days</span>
                        <strong>{progressSummary.practiceDayCount}</strong>
                        <p>Calendar days with saved practice.</p>
                    </div>

                    <div className="progress-summary-item">
                        <span>Accents practiced</span>
                        <strong>{progressSummary.accentCount}</strong>
                        <p>Out of {accentOrder.length} available accents.</p>
                    </div>
                </div>

                <section className="progress-streak-band">
                    <div className="progress-streak-copy">
                        <span className="result-label">Daily streaks</span>
                        <h2>{progressSummary.streakHeadline}</h2>
                        <p>
                            Streaks count logged-in pronunciation checks only. They track
                            saved practice activity, not audio accuracy or voice scoring.
                        </p>
                    </div>

                    <div className="progress-streak-metrics">
                        <div className="progress-streak-metric progress-streak-metric-primary">
                            <span>Current streak</span>
                            <strong>{progressSummary.currentStreakDays}</strong>
                            <p>{formatDayLabel(progressSummary.currentStreakDays)}</p>
                        </div>

                        <div className="progress-streak-metric">
                            <span>Best streak</span>
                            <strong>{progressSummary.bestStreakDays}</strong>
                            <p>{formatDayLabel(progressSummary.bestStreakDays)}</p>
                        </div>

                        <div className="progress-streak-metric">
                            <span>Practice today</span>
                            <strong>
                                {progressSummary.hasPracticedToday ? "Done" : "Open"}
                            </strong>
                            <p>{progressSummary.todayPracticeMessage}</p>
                        </div>
                    </div>
                </section>

                <div className="progress-insight-row">
                    <div className="progress-insight">
                        <span className="result-label">This week</span>
                        <strong>{progressSummary.practiceThisWeek}</strong>
                        <p>Saved practice items from the last 7 days.</p>
                    </div>

                    <div className="progress-insight">
                        <span className="result-label">Most practiced accent</span>
                        <strong>
                            {progressSummary.mostPracticedAccent
                                ? progressSummary.mostPracticedAccent.label
                                : "Not enough practice yet"}
                        </strong>
                        <p>
                            {progressSummary.mostPracticedAccent
                                ? `${progressSummary.mostPracticedAccent.count} saved item${
                                    progressSummary.mostPracticedAccent.count === 1
                                        ? ""
                                        : "s"
                                }.`
                                : "Practice a few words to see an accent pattern."}
                        </p>
                    </div>

                    <div className="progress-insight">
                        <span className="result-label">Last practice</span>
                        <strong>
                            {progressSummary.lastPracticeDate
                                ? formatRelativePracticeDate(progressSummary.lastPracticeDate)
                                : "No saved date"}
                        </strong>
                        <p>
                            {progressSummary.lastPracticeDate
                                ? formatDate(progressSummary.lastPracticeDate)
                                : "Saved practice will appear here."}
                        </p>
                    </div>
                </div>

                <div className="progress-section-grid">
                    <section className="progress-panel progress-panel-wide">
                        <div className="progress-panel-header">
                            <div>
                                <span className="result-label">Weekly rhythm</span>
                                <h2>Last 7 days</h2>
                            </div>
                        </div>

                        <div className="weekly-practice-row">
                            {progressSummary.weeklyPractice.map((day) => (
                                <div key={day.key} className="weekly-practice-day">
                                    <div className="weekly-practice-bar-track">
                                        <span
                                            className="weekly-practice-bar"
                                            style={{
                                                height: `${Math.max(
                                                    10,
                                                    (day.count / maxWeeklyCount) * 100
                                                )}%`,
                                            }}
                                        />
                                    </div>
                                    <strong>{day.count}</strong>
                                    <span>{day.label}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="progress-panel">
                        <div className="progress-panel-header">
                            <div>
                                <span className="result-label">Accent coverage</span>
                                <h2>Practice spread</h2>
                            </div>
                        </div>

                        <div className="accent-progress-list">
                            {progressSummary.accentRows.map((row) => (
                                <div key={row.accent} className="accent-progress-row">
                                    <div>
                                        <strong>{row.label}</strong>
                                        <span>
                                            {row.count > 0
                                                ? `${row.count} saved item${
                                                    row.count === 1 ? "" : "s"
                                                }`
                                                : "Try this accent"}
                                        </span>
                                    </div>
                                    <div
                                        className={
                                            row.count > 0
                                                ? "accent-progress-count accent-progress-count-active"
                                                : "accent-progress-count"
                                        }
                                    >
                                        {row.count}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="progress-section-grid progress-review-grid">
                    <section className="progress-panel">
                        <div className="progress-panel-header">
                            <div>
                                <span className="result-label">Review queue</span>
                                <h2>Favorite words</h2>
                            </div>
                            <span className="section-count-pill">
                                {progressSummary.favoriteCount}
                            </span>
                        </div>

                        {progressSummary.reviewQueue.length > 0 ? (
                            <div className="progress-review-list">
                                {progressSummary.reviewQueue.map((favorite) => (
                                    <div key={favorite.id} className="progress-review-item">
                                        <div>
                                            <strong>{favorite.text}</strong>
                                            <span>{getAccentLabel(favorite.accent)}</span>
                                        </div>
                                        {favorite.phonetic && <p>{favorite.phonetic}</p>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="progress-muted-text">
                                Save favorite pronunciation results to create a review queue.
                            </p>
                        )}
                    </section>

                    <section className="progress-panel">
                        <div className="progress-panel-header">
                            <div>
                                <span className="result-label">Recent practice</span>
                                <h2>Latest saved work</h2>
                            </div>
                        </div>

                        {progressSummary.recentPractice.length > 0 ? (
                            <div className="progress-recent-list">
                                {progressSummary.recentPractice.map((item) => (
                                    <div key={item.id} className="progress-recent-item">
                                        <div>
                                            <strong>{item.text}</strong>
                                            <span>{getAccentLabel(item.accent)}</span>
                                        </div>
                                        <time>{formatRelativePracticeDate(item.createdAt)}</time>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="progress-muted-text">
                                Your latest saved practice items will appear here.
                            </p>
                        )}
                    </section>
                </div>
            </div>
        </section>
    );
}

export default Progress;
