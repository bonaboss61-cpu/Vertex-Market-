import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Shield, Zap, ArrowRight, BarChart2, Globe, Lock, TrendingUp, ChevronDown } from 'lucide-react';

export default function Landing() {

  return (
    <div className="min-h-screen bg-[#050608] text-white font-sans selection:bg-emerald-500/30">
      {/* Navigation */}
      <nav className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-xl font-bold tracking-tight">Vertex<span className="text-emerald-500">.</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/trade" className="text-sm font-medium text-gray-300 hover:text-white transition-colors hidden md:block">Sign In</Link>
            <Link to="/trade" className="bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center gap-2 group">Start Trading <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold tracking-widest uppercase mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Next-Gen Trading Platform
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            Trade the world's markets <br className="hidden md:block"/>
            with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">absolute precision</span>.
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Experience lightning-fast execution, institutional-grade analytics, and an intuitive interface designed for serious traders. Join over 1M+ active users on Vertex.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/trade" className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2">Launch Platform</Link>
            <button className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center justify-center gap-2">
              <BarChart2 className="w-5 h-5" /> View Live Markets
            </button>
          </div>
        </div>
      </section>

      
      {/* About Section */}
      <section id="about" className="py-24 bg-[#0a0c10]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-mono font-bold tracking-widest uppercase mb-6">
                About Vertex
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Empowering traders worldwide.</h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                Vertex was founded with a singular mission: to democratize access to institutional-grade trading tools. We believe that everyone should have the opportunity to participate in global markets with absolute transparency and precision.
              </p>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                Our team consists of former quantitative analysts, software engineers, and financial experts who have built a platform that bridges the gap between retail and institutional trading.
              </p>
              <div className="flex items-center gap-8">
                <div>
                  <div className="text-3xl font-extrabold text-white">1M+</div>
                  <div className="text-sm text-gray-500 uppercase tracking-widest font-mono">Active Users</div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-emerald-400">$50B+</div>
                  <div className="text-sm text-gray-500 uppercase tracking-widest font-mono">Quarterly Volume</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-indigo-500/20 rounded-2xl blur-3xl"></div>
              <div className="relative bg-[#050608] border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Global Reach</h3>
                    <p className="text-sm text-gray-400">Available in 150+ countries</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Regulated Entity</h3>
                    <p className="text-sm text-gray-400">Fully compliant operations</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-rose-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">99.99% Uptime</h3>
                    <p className="text-sm text-gray-400">Reliability you can trust</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-24 border-t border-white/5 bg-[#080b13]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Engineered for Performance</h2>
            <p className="text-gray-400">Everything you need to analyze, execute, and scale your trading strategies.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Sub-Millisecond Execution</h3>
              <p className="text-gray-400 leading-relaxed">Our proprietary matching engine handles millions of transactions per second, ensuring you never miss a market movement.</p>
            </div>
            
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Advanced Charting</h3>
              <p className="text-gray-400 leading-relaxed">Fully customizable charts with 50+ technical indicators, drawing tools, and real-time tick-by-tick data streaming.</p>
            </div>
            
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Bank-Grade Security</h3>
              <p className="text-gray-400 leading-relaxed">Your funds are protected by enterprise-grade cold storage, multi-signature wallets, and rigorous compliance standards.</p>
            </div>
          </div>
        </div>
      </section>

      
      {/* FAQ Section */}
      <section id="faq" className="py-24 border-t border-white/5 bg-[#050608]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-400">Everything you need to know about trading with Vertex.</p>
          </div>
          
          <div className="space-y-4">
            {[
              {
                q: "What is the minimum deposit?",
                a: "The minimum deposit to start live trading on Vertex is $10. However, you can open a free demo account with $10,000 in virtual funds to practice your strategies before committing real capital."
              },
              {
                q: "How fast are withdrawals processed?",
                a: "We process most cryptocurrency withdrawals within 5-10 minutes. Fiat withdrawals to your bank account typically take 1-3 business days depending on your location and banking provider."
              },
              {
                q: "Are my funds secure?",
                a: "Yes. We employ bank-grade security protocols. 98% of user funds are stored offline in cold storage, and all accounts feature mandatory Two-Factor Authentication (2FA). Vertex is also fully regulated and compliant with international financial standards."
              },
              {
                q: "What instruments can I trade?",
                a: "Vertex currently supports a wide range of markets including major and minor Forex pairs, top cryptocurrencies (BTC, ETH, SOL, XRP), commodities like Gold and Silver, and major stock indices."
              }
            ].map((faq, i) => (
              <details key={i} className="group bg-white/5 border border-white/10 rounded-xl overflow-hidden cursor-pointer">
                <summary className="flex items-center justify-between p-6 font-semibold text-lg hover:text-emerald-400 transition-colors">
                  {faq.q}
                  <ChevronDown className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-6 pb-6 text-gray-400 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof & Footer */}
      <footer className="border-t border-white/5 py-12 text-center bg-[#050608]">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Activity className="w-6 h-6 text-emerald-500" />
          <span className="text-2xl font-bold text-gray-300">Vertex</span>
        </div>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Trading involves significant risk and may result in the loss of your invested capital. Please ensure you fully understand the risks involved.
        </p>
        <div className="mt-8 text-gray-600 text-xs">
          &copy; {new Date().getFullYear()} Vertex Trading Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
