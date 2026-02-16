"use client";

import React from 'react';
import { Star, Quote } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
    {
        name: "Budi Santoso",
        role: "Karyawan Swasta",
        content: "Dulu manajemen gaji berantakan banget. Sejak pakai KeuanganKu, saya jadi tahu uang saya lari ke mana saja. Fitur download laporannya sangat membantu buat arsip bulanan.",
        avatar: "/images/avatars/user1.png",
        rating: 5
    },
    {
        name: "Siska Putri",
        role: "Freelancer",
        content: "Fitur kalkulator dana pendidikannya juara! Saya jadi punya gambaran jelas harus nabung berapa tiap bulan buat sekolah anak nanti. Sangat worth it upgrade ke Pro.",
        avatar: "/images/avatars/user2.png",
        rating: 5
    },
    {
        name: "Andi Wijaya",
        role: "Entrepreneur",
        content: "Analisis risikonya akurat. Sebagai orang yang awam investasi, aplikasi ini membimbing saya langkah demi langkah. UX-nya juga sangat clean dan gak bikin pusing.",
        avatar: "/images/avatars/user3.png",
        rating: 4
    }
];

const TestimonialsSection = () => {
    return (
        <section id="testimonials" className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <Badge variant="outline" className="mb-4 border-blue-200 text-blue-700 bg-blue-50 px-4 py-1">
                        Testimoni
                    </Badge>
                    <h2 className="text-3xl font-black text-slate-900 sm:text-4xl tracking-tight">
                        Apa Kata <span className="text-blue-600">Mereka?</span>
                    </h2>
                    <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
                        Ribuan orang telah mempercayakan perencanaan keuangan mereka kepada kami. Inilah cerita mereka.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <Card key={i} className="border-slate-100 shadow-xl shadow-slate-100/50 rounded-[2rem] relative hover:border-blue-200 transition-all duration-300 group">
                            <CardContent className="p-8">
                                <Quote className="absolute top-6 right-8 text-slate-100 h-12 w-12 z-0 group-hover:text-blue-50 transition-colors" />

                                <div className="flex gap-1 mb-4 relative z-10">
                                    {[...Array(5)].map((_, index) => (
                                        <Star
                                            key={index}
                                            size={16}
                                            className={`${index < t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`}
                                        />
                                    ))}
                                </div>

                                <p className="text-slate-700 leading-relaxed mb-8 relative z-10 italic">
                                    "{t.content}"
                                </p>

                                <div className="flex items-center gap-4 relative z-10">
                                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                        <AvatarImage src={t.avatar} alt={t.name} />
                                        <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">
                                            {t.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h4 className="font-bold text-slate-900 leading-none">{t.name}</h4>
                                        <p className="text-sm text-slate-500 mt-1">{t.role}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;