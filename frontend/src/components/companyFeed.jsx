import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import BarChart from "./charts/BarChart";
import DonutChart from "./charts/DonutChart";
import LineChart from "./charts/LineChart";

const CompanyFeed = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [trendPoints, setTrendPoints] = useState([]);
    const [allRequests, setAllRequests] = useState([]);
    const [rangeDays, setRangeDays] = useState(14);
    const [offsetDays, setOffsetDays] = useState(0); // 0=today anchored, positive moves window into the past
    const [companyMeta, setCompanyMeta] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try{
                const res = await axios.get(BASE_URL + "/company/feed", { withCredentials: true });
                const payload = res?.data || {};
                const analytics = payload.analytics || payload;
                const normalized = {
                    totalPickupRequests: analytics.totalPickupRequests ?? 0,
                    pendingPickupRequests: analytics.pendingPickupRequests ?? 0,
                    acceptedPickupRequests: analytics.acceptedPickupRequests ?? 0,
                    rejectedPickupRequests: analytics.rejectedPickupRequests ?? 0,
                    pickedUpPickupRequests: analytics.pickedUpPickupRequests ?? 0,
                    diyVideos: analytics.diyVideos ?? 0,
                };
                setData(normalized);
                setCompanyMeta(payload.company || null);
                setError("");

                const embeddedRequests = Array.isArray(payload.recentRequests) ? payload.recentRequests : null;
                if (embeddedRequests) {
                    setAllRequests(embeddedRequests);
                } else {
                    // Fallback for older backend versions
                    try {
                        const listRes = await axios.get(BASE_URL + "/pickup/company/requests/pickup", { withCredentials: true });
                        const list = Array.isArray(listRes?.data?.data) ? listRes.data.data : [];
                        setAllRequests(list);
                    } catch (_) {
                        setAllRequests([]);
                    }
                }
            }
            catch(err){
                console.log("Error fetching company feed:", err);
                setError("Failed to load analytics. Please try again.");
            }
            finally{
                setLoading(false);
            }
        };
            fetchData();
    }, []);
    
    // Compute trend points always, even if loading
    const computedTrend = useMemo(() => {
        const days = Math.max(1, rangeDays);
        const start = new Date();
        start.setHours(0,0,0,0);
        start.setDate(start.getDate() - (days - 1) - offsetDays);
        const buckets = [];
        for (let i = 0; i < days; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            buckets.push({ date: new Date(d), count: 0 });
        }
        for (const r of allRequests) {
            const created = new Date(r.createdAt || r.updatedAt || Date.now());
            created.setHours(0,0,0,0);
            if (created >= buckets[0].date && created <= buckets[buckets.length - 1].date) {
                const idx = Math.round((created - buckets[0].date) / (1000*60*60*24));
                if (buckets[idx]) buckets[idx].count += 1;
            }
        }
        return buckets.map(b => ({ x: b.date, y: b.count }));
    }, [allRequests, rangeDays, offsetDays]);

    useEffect(() => {
        setTrendPoints(computedTrend);
    }, [computedTrend]);
    
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-teal-50 to-green-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-teal-600 mx-auto"></div>
                    <p className="mt-4 text-teal-700 font-medium">Loading analytics...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-teal-50 to-green-50">
                <div className="bg-white p-8 rounded-lg shadow-lg border-l-4 border-red-500 max-w-md">
                    <h2 className="text-xl font-semibold text-red-600">Error</h2>
                    <p className="mt-2 text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    // Metrics for charts
    const metrics = [
        { key: "pendingPickupRequests", label: "Pending", value: data.pendingPickupRequests, color: "bg-yellow-400" },
        { key: "acceptedPickupRequests", label: "Accepted", value: data.acceptedPickupRequests, color: "bg-green-500" },
        { key: "rejectedPickupRequests", label: "Rejected", value: data.rejectedPickupRequests, color: "bg-red-500" },
        { key: "pickedUpPickupRequests", label: "Picked Up", value: data.pickedUpPickupRequests, color: "bg-blue-500" },
        { key: "diyVideos", label: "DIY Videos", value: data.diyVideos, color: "bg-teal-500" },
    ];

    const maxValue = Math.max(1, ...metrics.map(m => m.value));

    // Donut chart (distribution of request statuses only)
    const statusMetrics = [
        { key: "pendingPickupRequests", label: "Pending", value: data.pendingPickupRequests, color: "#f59e0b" }, // yellow-500
        { key: "acceptedPickupRequests", label: "Accepted", value: data.acceptedPickupRequests, color: "#22c55e" }, // green-500
        { key: "rejectedPickupRequests", label: "Rejected", value: data.rejectedPickupRequests, color: "#ef4444" }, // red-500
        { key: "pickedUpPickupRequests", label: "Picked Up", value: data.pickedUpPickupRequests, color: "#3b82f6" }, // blue-500
    ];
    const statusTotal = Math.max(1, statusMetrics.reduce((sum, m) => sum + (m.value || 0), 0));

    // (moved computedTrend and its effect above the conditional returns)

    return(
        <div className="min-h-screen bg-gradient-to-b from-teal-50 to-green-50 py-8 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto">
                {/* Hero */}
                <div className="bg-gradient-to-r from-teal-600 to-green-500 rounded-2xl shadow-lg overflow-hidden mb-8">
                    <div className="px-8 py-12 md:flex items-center justify-between">
                        <div className="md:w-2/3 mb-6 md:mb-0">
                            <h1 className="text-3xl md:text-4xl font-bold text-white">
                                {companyMeta?.companyName || "Company Analytics"}
                            </h1>
                            <p className="mt-3 text-teal-50 text-lg">
                                Track requests and outcomes for {companyMeta?.companyName ? "your organisation only" : "your organisation"}.
                            </p>
                            {companyMeta && (
                                <div className="mt-4  grid grid-cols-1 sm:grid-cols-2 gap-3 text-teal-600 text-sm">
                                    <div className="bg-white bg-opacity-15 rounded-lg px-4 py-3">
                                        <p className="uppercase text-xs tracking-widest opacity-80">Waste Type</p>
                                        <p className=" text-lg font-semibold">{companyMeta.wasteType || "N/A"}</p>
                                    </div>
                                    <div className="bg-white bg-opacity-15 rounded-lg px-4 py-3">
                                        <p className="uppercase text-xs tracking-widest opacity-80">Location</p>
                                        <p className="text-lg font-semibold">{companyMeta.location || "Not specified"}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="md:w-1/3 flex justify-end">
                            <a href="/pickuprequest" className="bg-white text-teal-600 hover:bg-teal-50 shadow-md font-medium px-5 py-3 rounded-lg transition-all duration-300 flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8" />
                                </svg>
                                View Pickup Requests
                            </a>
                        </div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow p-6 border border-teal-50">
                        <p className="text-sm text-gray-500">Total Requests</p>
                        <p className="mt-2 text-3xl font-bold text-teal-700">{data.totalPickupRequests}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-6 border border-yellow-50">
                        <p className="text-sm text-gray-500">Pending</p>
                        <p className="mt-2 text-3xl font-bold text-yellow-600">{data.pendingPickupRequests}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-6 border border-green-50">
                        <p className="text-sm text-gray-500">Handled</p>
                        <p className="mt-2 text-3xl font-bold text-green-600">{data.acceptedPickupRequests + data.pickedUpPickupRequests}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-6 border border-teal-50">
                        <p className="text-sm text-gray-500">DIY Videos</p>
                        <p className="mt-2 text-3xl font-bold text-teal-600">{data.diyVideos}</p>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Bar Chart */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-xl font-semibold text-teal-800">Requests Breakdown</h2>
                            {/* <div className="flex items-center gap-2 text-xs text-gray-600">
                                {metrics.map(m => (
                                    <div key={m.key} className="flex items-center">
                                        <span className={`inline-block w-2.5 h-2.5 rounded-sm mr-1 ${m.color}`}></span>
                                        <span className="mr-2">{m.label}</span>
                                    </div>
                                ))}
                            </div> */}
                        </div>
                        <BarChart
                            data={
                                metrics.map(m => ({ label: m.label, value: m.value, colorClass: m.color }))
                            }
                            maxValue={maxValue}
                            height={224}
                        />
                    </div>

                    {/* Donut Chart */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <h2 className="text-xl font-semibold text-teal-800 mb-4">Status Distribution</h2>
                        <DonutChart
                            segments={statusMetrics.map(m => ({ label: m.label, value: m.value, color: m.color }))}
                            size={220}
                            radius={70}
                            strokeWidth={18}
                            centerTitle={statusTotal}
                            centerSubtitle="Requests"
                        />
                    </div>
                </div>

                {/* Line Chart - Requests over selected window with pan */}
                <div className="mt-6 bg-white rounded-xl shadow p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-semibold text-teal-800">Requests Overview</h2>
                        <div className="flex items-center gap-2">
                            <button
                                className="px-3 py-1.5 text-sm rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
                                onClick={() => setOffsetDays(offsetDays + Math.max(1, Math.floor(rangeDays/2)))}
                            >
                                ◀ Prev
                            </button>
                            <select
                                className="px-2 py-1.5 text-sm rounded-md bg-gray-100 text-gray-700"
                                value={rangeDays}
                                onChange={(e) => setRangeDays(parseInt(e.target.value, 10))}
                            >
                                <option value={7}>7 days</option>
                                <option value={14}>14 days</option>
                                <option value={30}>30 days</option>
                                <option value={60}>60 days</option>
                                <option value={90}>90 days</option>
                            </select>
                            <button
                                className="px-3 py-1.5 text-sm rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50"
                                onClick={() => setOffsetDays(Math.max(0, offsetDays - Math.max(1, Math.floor(rangeDays/2))))}
                                disabled={offsetDays === 0}
                            >
                                Next ▶
                            </button>
                            <button
                                className="ml-2 px-3 py-1.5 text-sm rounded-md bg-teal-600 text-white hover:bg-teal-700"
                                onClick={() => setOffsetDays(0)}
                            >
                                Today
                            </button>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Drag window using Prev/Next, change duration from the dropdown.</p>
                    <div className="w-full">
                        <LineChart points={trendPoints} width={800} height={260} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CompanyFeed;