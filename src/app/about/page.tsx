"use client";

import { motion } from "framer-motion";
import { Globe, Zap, Shield, Code, Heart, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
    const features = [
        {
            icon: Globe,
            title: "Smart Domain Generation",
            description:
                "Multiple AI strategies including phonetic patterns, syllable mixing, and compound words to create memorable domain names.",
        },
        {
            icon: Zap,
            title: "Fast Availability Checking",
            description:
                "Check hundreds of domains in seconds using RDAP protocol with smart caching and rate limiting.",
        },
        {
            icon: Shield,
            title: "Secure API Storage",
            description:
                "Your registrar API keys are encrypted with AES-256-GCM and never leave your server.",
        },
        {
            icon: Code,
            title: "Open Architecture",
            description:
                "Built with Next.js 14, TypeScript, and Prisma. Easy to extend with new registrar adapters.",
        },
    ];

    return (
        <div className="flex-1 min-h-screen p-8">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl font-bold mb-2">About DomainHunter</h1>
                    <p className="text-lg text-muted-foreground mb-8">
                        AI-powered domain name generation and availability checking
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="grid gap-6 md:grid-cols-2 mb-12"
                >
                    {features.map((feature, index) => (
                        <div
                            key={feature.title}
                            className="p-6 rounded-xl border border-border/50 bg-surface/50 backdrop-blur-sm"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                            >
                                <feature.icon className="h-8 w-8 text-accent mb-4" />
                                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {feature.description}
                                </p>
                            </motion.div>
                        </div>
                    ))}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="p-6 rounded-xl border border-border/50 bg-surface/50 backdrop-blur-sm mb-8"
                >
                    <h2 className="text-xl font-semibold mb-4">How It Works</h2>
                    <ol className="space-y-4">
                        <li className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold">
                                1
                            </span>
                            <div>
                                <h4 className="font-medium">Enter Keywords</h4>
                                <p className="text-sm text-muted-foreground">
                                    Add your brand keywords or phrases, one per line.
                                </p>
                            </div>
                        </li>
                        <li className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold">
                                2
                            </span>
                            <div>
                                <h4 className="font-medium">Generate Domains</h4>
                                <p className="text-sm text-muted-foreground">
                                    Our AI creates variations using multiple strategies.
                                </p>
                            </div>
                        </li>
                        <li className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold">
                                3
                            </span>
                            <div>
                                <h4 className="font-medium">Check Availability</h4>
                                <p className="text-sm text-muted-foreground">
                                    See which domains are available in real-time.
                                </p>
                            </div>
                        </li>
                        <li className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold">
                                4
                            </span>
                            <div>
                                <h4 className="font-medium">Export & Register</h4>
                                <p className="text-sm text-muted-foreground">
                                    Export results and register your perfect domain.
                                </p>
                            </div>
                        </li>
                    </ol>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="text-center text-sm text-muted-foreground"
                >
                    <p className="flex items-center justify-center gap-2">
                        Built with <Heart className="h-4 w-4 text-red-500" /> using Next.js and
                        TypeScript
                    </p>
                    <div className="mt-4 flex justify-center gap-4">
                        <Button variant="outline" size="sm" asChild>
                            <a
                                href="https://github.com/yourusername/domainhunter"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2"
                            >
                                <Code className="h-4 w-4" />
                                View Source
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
