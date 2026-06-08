import { useState } from 'react';
import { Check, Zap, Crown, Sparkles, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    unit: 'PKR / month',
    icon: Sparkles,
    color: 'from-slate-500 to-slate-700',
    border: 'border-slate-200 dark:border-zinc-700',
    badge: null,
    features: [
      '500 AI credits per month',
      'AI Tutor (all subjects)',
      'Study Planner (2 plans)',
      'Practice Questions',
      'Challenge Mode',
      'Basic analytics',
    ],
    limitations: [
      'No image generation',
      'Limited chat history (7 days)',
    ],
    cta: 'Current Plan',
    disabled: true,
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 300,
    unit: 'PKR / month',
    icon: Zap,
    color: 'from-blue-500 to-blue-700',
    border: 'border-blue-300 dark:border-blue-700',
    badge: 'Popular',
    features: [
      '2,000 AI credits per month',
      'AI Tutor (all subjects)',
      'Unlimited Study Plans',
      'AI-generated diagrams & images',
      'Full chat history',
      'Practice Questions + Challenge',
      'Priority AI responses',
      'Notes generation',
    ],
    limitations: [],
    cta: 'Upgrade to Basic',
    disabled: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 700,
    unit: 'PKR / month',
    icon: Crown,
    color: 'from-amber-400 to-orange-500',
    border: 'border-amber-300 dark:border-amber-700',
    badge: 'Best Value',
    features: [
      'Unlimited AI credits',
      'Everything in Basic',
      'Advanced analytics & reports',
      'Custom study curriculum',
      'Exam preparation mode',
      'Teacher dashboard',
      'Multi-device sync',
      'Priority support (24/7)',
    ],
    limitations: [],
    cta: 'Upgrade to Premium',
    disabled: false,
  },
];

function PlanCard({ plan, isActive, onSelect }) {
  const Icon = plan.icon;
  return (
    <div className={`relative flex flex-col bg-white dark:bg-zinc-900 rounded-3xl border-2 ${plan.border} p-6 transition-all duration-300 hover:shadow-xl ${isActive ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-zinc-950' : ''}`}>
      {plan.badge && (
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r ${plan.color} text-white text-[11px] font-bold px-4 py-1 rounded-full shadow-md`}>
          {plan.badge}
        </div>
      )}

      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-5 shadow-lg`}>
        <Icon size={22} className="text-white" />
      </div>

      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{plan.name}</h3>
      <div className="flex items-baseline gap-1 mb-5">
        <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{plan.price === 0 ? 'Free' : `₨${plan.price}`}</span>
        {plan.price > 0 && <span className="text-sm text-slate-400 dark:text-slate-500">{plan.unit}</span>}
      </div>

      <ul className="space-y-2.5 flex-1 mb-6">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
            <Check size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
        {plan.limitations.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-slate-400 dark:text-slate-500 line-through">
            <Check size={15} className="text-slate-300 dark:text-slate-600 flex-shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>

      <button
        onClick={() => !plan.disabled && onSelect(plan.id)}
        disabled={plan.disabled}
        className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
          plan.disabled
            ? 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-slate-500 cursor-default'
            : `bg-gradient-to-r ${plan.color} text-white hover:opacity-90 shadow-md`
        }`}
      >
        {isActive && plan.id === 'free' ? '✓ Active Plan' : plan.cta}
      </button>
    </div>
  );
}

export default function Pricing({ setActiveView }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [selected, setSelected] = useState(null);

  const handleSelect = (planId) => {
    setSelected(planId);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-5xl mx-auto pb-16 animate-fadeIn">
        <button onClick={() => setActiveView('dashboard')}
          className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors">
          <ArrowLeft size={16} /> {t('dashboard')}
        </button>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">{t('choosePlan')}</h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {t('pricingDesc')}
          </p>
        </div>

        {/* Credits warning */}
        {user?.aiCreditsUsed >= 450 && (
          <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center gap-3">
            <Zap size={20} className="text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">You're running low on credits!</p>
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">{(user.aiCreditsLimit || 500) - (user.aiCreditsUsed || 0)} credits remaining. Upgrade to keep learning without interruptions.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map(plan => (
            <PlanCard key={plan.id} plan={plan} isActive={plan.id === 'free'} onSelect={handleSelect} />
          ))}
        </div>

        {selected && selected !== 'free' && (
          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl text-center animate-fadeIn">
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">{t('paymentSoon')}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Online payment for the <strong>{PLANS.find(p => p.id === selected)?.name}</strong> plan will be available soon.
              For now, contact us at <strong>support@eduai.pk</strong> to activate your upgrade.
            </p>
          </div>
        )}

        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { label: 'Active Students', value: '10,000+' },
            { label: 'Subjects Covered', value: '15+' },
            { label: 'Classes Supported', value: '1–PhD' },
            { label: 'AI Responses Daily', value: '50,000+' },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-4">
              <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{s.value}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
