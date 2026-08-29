import {useState, useEffect} from 'react';
import {
    User,
    Mail,
    Lock,
    Shield,
    Brain,
    Terminal,
    Zap,
    Bot,
    Database,
    Sunrise,
    Sun,
    Moon,
    Palette,
    Check,
} from 'lucide-react';
import {db} from '../db';
import logo from '../assets/logo.png';

interface OnboardingProps {
    onComplete: () => void;
}

const Onboarding = ({onComplete}: OnboardingProps) => {
    const [section, setSection] = useState<'welcome' | 'setup'>('welcome');
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        theme_preference: 'system' as 'light' | 'dark' | 'system', // Default to system theme
        avatar_url: ''
    });
    const [animationClass, setAnimationClass] = useState('animate-fadeIn');
    const [logoError, setLogoError] = useState(false);

    // Apply theme immediately when selected
    useEffect(() => {
        const htmlElement = document.documentElement;
        if (formData.theme_preference === 'dark') {
            htmlElement.classList.add('dark');
        } else {
            htmlElement.classList.remove('dark');
        }
    }, [formData.theme_preference]);



    const handleSubmit = async () => {
        console.log('handleSubmit called with formData:', formData);
        try {
            console.log('Creating user account...');
            // Create user account
            const userId = await db.createUser({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                personalInfo: {
                    name: formData.name,
                    email: formData.email,
                    timezone: formData.timezone,
                    theme_preference: formData.theme_preference,
                    avatar_url: formData.avatar_url,
                    startup_settings: {
                        autoStart: false,
                        startMinimized: false,
                        startFullscreen: false,
                        checkForUpdates: true,
                        restoreLastSession: true
                    }
                },
                apiConfig: {
                    comfyui_base_url: 'http://localhost:8188'
                }
            });
            console.log('User created with ID:', userId);

            // Set as current user
            console.log('Setting current user...');
            await db.setCurrentUser(userId);

            // Save personal info to global settings for backward compatibility
            console.log('Updating personal info...');
            await db.updatePersonalInfo({
                name: formData.name,
                email: formData.email,
                timezone: formData.timezone,
                theme_preference: formData.theme_preference,
                avatar_url: formData.avatar_url,
                startup_settings: {
                    autoStart: false,
                    startMinimized: false,
                    startFullscreen: false,
                    checkForUpdates: true,
                    restoreLastSession: true
                }
            });

            console.log('Calling onComplete...');
            onComplete();
        } catch (error) {
            console.error('Error creating user:', error);
            alert('Erreur lors de la création du compte: ' + (error as Error).message);
        }
    };

    const handleNextSection = (nextSection: 'welcome' | 'setup') => {
        setAnimationClass('animate-fadeOut');
        setTimeout(() => {
            setSection(nextSection);
            if (nextSection === 'setup') setStep(1);
            setAnimationClass('animate-fadeIn');
        }, 300);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (section === 'setup') {
                if (step < 4) {
                    if ((step === 1 && formData.name) ||
                        (step === 2 && formData.email) ||
                        (step === 3 && formData.password)) {
                        setStep(step + 1);
                    }
                } else {
                    handleSubmit();
                }
            }
        }
    };

    // Features of Clara
    const features = [
        {
            title: "Méthodologie par phase",
            description: "Méthodologie par phase et étape de mission pour un audit structuré et efficace.",
            icon: <Shield className="w-8 h-8 text-sakura-500"/>
        },
        {
            title: "Conformité CRIPP 2025",
            description: "Conformité intégrale aux normes CRIPP 2025 pour des audits professionnels.",
            icon: <Brain className="w-8 h-8 text-sakura-500"/>
        },
        {
            title: "Génération de rapports",
            description: "Génération automatique des rapports d'audit complets et professionnels.",
            icon: <Terminal className="w-8 h-8 text-sakura-500"/>
        },
        {
            title: "Exécution rapide",
            description: "Exécutez facilement et rapidement les missions d'audit.",
            icon: <Database className="w-8 h-8 text-sakura-500"/>
        }
    ];

    // Helper function to get timezone display name with UTC offset
    const getTimezoneDisplay = (timezone: string) => {
        try {
            const now = new Date();
            const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
            const targetTime = new Date(utcTime + (getTimezoneOffset(timezone) * 3600000));
            const offset = getTimezoneOffset(timezone);
            const offsetString = offset >= 0 ? `+${offset}` : `${offset}`;
            return `${timezone} (UTC${offsetString})`;
        } catch {
            return timezone;
        }
    };

    // Helper function to get timezone offset in hours
    const getTimezoneOffset = (timezone: string) => {
        try {
            const now = new Date();
            const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
            const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
            return Math.round((tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60));
        } catch {
            return 0;
        }
    };

    // Welcome section
    if (section === "welcome") {
        return (
            <div
                className="fixed inset-0 bg-gradient-to-br from-white to-sakura-50 dark:from-gray-900 dark:to-gray-800 z-50 overflow-y-auto">
                <div className="min-h-screen w-full flex flex-col">
                    <div className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                        <div className="w-full max-w-7xl mx-auto">
                            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
                                <div className="w-full lg:w-1/2 text-center lg:text-left space-y-4 sm:space-y-6">
                                    <div className="flex justify-center lg:justify-start">
                                        <div className="relative">
                                            <div
                                                className="absolute inset-0 bg-sakura-500 rounded-lg blur-xl opacity-20 animate-pulse"></div>
                                            <div
                                                className="relative w-16 h-16 sm:w-20 sm:h-20">
                                                {!logoError ? (
                                                    <img
                                                        src={logo}
                                                        alt="E-audit Logo"
                                                        className="w-full h-full object-contain"
                                                        onError={() => setLogoError(true)}
                                                    />
                                                ) : (
                                                    <Bot className="w-12 h-12 sm:w-16 sm:h-16 text-sakura-500" />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white animate-fadeIn leading-tight">
                                        Bienvenue sur <span className="text-sakura-500">E-audit</span>
                                    </h1>

                                    <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0 animate-fadeInUp delay-200 leading-relaxed">
                                        Automatisez vos activités d'audit, risques et contrôles
                                    </p>
                                </div>

                                <div className="w-full lg:w-1/2 max-w-2xl">
                                    <div
                                        className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 animate-fadeInUp delay-300">
                                        {features.map((feature, idx) => (
                                            <div
                                                key={idx}
                                                className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-850 backdrop-blur-md rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-sakura-200 dark:hover:border-sakura-900 group"
                                            >
                                                <div
                                                    className="p-3 bg-sakura-100 dark:bg-sakura-900/20 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
                                                    {feature.icon}
                                                </div>
                                                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                                                    {feature.title}
                                                </h3>
                                                <p className="text-gray-600 dark:text-gray-400">
                                                    {feature.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full px-4 pb-6 sm:pb-8 flex justify-center animate-fadeInUp delay-500 shrink-0">
                        <button
                            onClick={() => handleNextSection("setup")}
                            className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-[#ec4899] to-[#db2777] hover:from-[#db2777] hover:to-[#be185d] !text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 hover:gap-3"
                            style={{ backgroundColor: '#ec4899', color: '#ffffff' }}
                        >
                            Démarrer <Zap className="w-5 h-5"/>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Setup section - Enhanced version of the original form
    return (
        <div
            className="fixed inset-0 bg-gradient-to-br from-white to-sakura-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center z-50 overflow-y-auto py-6">
            <div
                className={`glassmorphic rounded-2xl p-6 sm:p-8 max-w-md w-full mx-4 space-y-4 sm:space-y-6 shadow-2xl ${animationClass}`}>
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        Configuration de E-audit
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        {step === 1 ? "D'abord, parlez-nous un peu de vous" :
                            step === 2 ? "Comment pouvons-nous vous contacter ?" :
                                step === 3 ? "Créez votre mot de passe" :
                                    "Choisissez votre thème préféré"}
                    </p>

                    {/* Progress indicator */}
                    <div className="flex items-center justify-center gap-2 mt-4">
                        {[1, 2, 3, 4].map((s) => (
                            <div
                                key={s}
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    s === step ? 'w-8 bg-sakura-500' : s < step ? 'w-8 bg-green-500' : 'w-4 bg-gray-300 dark:bg-gray-600'
                                }`}
                            />
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    {step === 1 && (
                        <div className="space-y-4 animate-fadeIn">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-sakura-100 dark:bg-sakura-100/10 rounded-lg">
                                    <User className="w-6 h-6 text-sakura-500"/>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Comment devons-nous vous appeler ?
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Votre nom permet de personnaliser votre expérience avec E-audit.
                            </p>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                                onKeyDown={handleKeyDown}
                                className="w-full px-4 py-2 rounded-lg bg-white/50 border border-gray-200 focus:outline-none focus:border-sakura-300 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-100"
                                placeholder="Votre nom"
                                autoFocus
                            />
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-fadeIn">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-sakura-100 dark:bg-sakura-100/10 rounded-lg">
                                    <Mail className="w-6 h-6 text-sakura-500"/>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Comment pouvons-nous vous contacter ?
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Votre email est stocké localement et n'est jamais partagé. Il sera utilisé pour les fonctionnalités futures comme la sauvegarde des préférences entre appareils.
                            </p>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                                onKeyDown={handleKeyDown}
                                className="w-full px-4 py-2 rounded-lg bg-white/50 border border-gray-200 focus:outline-none focus:border-sakura-300 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-100"
                                placeholder="votre.email@exemple.com"
                                autoFocus
                            />
                        </div>
                    )}

                    {/* New Theme Selection Step */}
                    {step === 3 && (
                        <div className="space-y-4 animate-fadeIn">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-sakura-100 dark:bg-sakura-100/10 rounded-lg">
                                    <Lock className="w-6 h-6 text-sakura-500"/>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Créez votre mot de passe
                                </h3>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Choisissez un mot de passe sécurisé pour votre compte E-audit.
                            </p>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                                onKeyDown={handleKeyDown}
                                className="w-full px-4 py-2 rounded-lg bg-white/50 border border-gray-200 focus:outline-none focus:border-sakura-300 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-100"
                                placeholder="Entrez votre mot de passe"
                                autoFocus
                            />
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-4 animate-fadeIn">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-sakura-100 dark:bg-sakura-100/10 rounded-lg">
                                    <Palette className="w-6 h-6 text-sakura-500"/>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Choisissez votre thème
                                </h3>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Sélectionnez votre thème d'interface préféré. Vous pourrez le modifier plus tard dans les paramètres.
                            </p>

                            <div className="flex flex-col gap-4 mt-6">
                                <button
                                    onClick={() => setFormData(prev => ({...prev, theme_preference: 'dark'}))}
                                    className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                                        formData.theme_preference === 'dark'
                                            ? 'border-sakura-500 bg-sakura-50 dark:bg-sakura-900/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-sakura-300'
                                    }`}
                                >
                                    <div
                                        className={`p-3 rounded-full ${formData.theme_preference === 'dark' ? 'bg-sakura-100 text-sakura-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                                        <Moon className="w-6 h-6"/>
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h4 className="font-medium text-gray-900 dark:text-white">Mode Sombre</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Plus doux pour les yeux, idéal pour la plupart des environnements</p>
                                    </div>
                                    {formData.theme_preference === 'dark' && (
                                        <Check className="w-5 h-5 text-sakura-500"/>
                                    )}
                                </button>

                                <button
                                    onClick={() => setFormData(prev => ({...prev, theme_preference: 'light'}))}
                                    className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                                        formData.theme_preference === 'light'
                                            ? 'border-sakura-500 bg-sakura-50 dark:bg-sakura-900/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-sakura-300'
                                    }`}
                                >
                                    <div
                                        className={`p-3 rounded-full ${formData.theme_preference === 'light' ? 'bg-sakura-100 text-sakura-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                                        <Sun className="w-6 h-6"/>
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h4 className="font-medium text-gray-900 dark:text-white">Mode Clair</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Interface lumineuse pour une utilisation en journée</p>
                                    </div>
                                    {formData.theme_preference === 'light' && (
                                        <Check className="w-5 h-5 text-sakura-500"/>
                                    )}
                                </button>

                                <button
                                    onClick={() => setFormData(prev => ({...prev, theme_preference: 'system'}))}
                                    className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                                        formData.theme_preference === 'system'
                                            ? 'border-sakura-500 bg-sakura-50 dark:bg-sakura-900/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-sakura-300'
                                    }`}
                                >
                                    <div
                                        className={`p-3 rounded-full ${formData.theme_preference === 'system' ? 'bg-sakura-100 text-sakura-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                                        <div className="relative">
                                            <Sunrise className="w-6 h-6"/>
                                        </div>
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h4 className="font-medium text-gray-900 dark:text-white">Système par défaut</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Suit les paramètres de thème de votre appareil</p>
                                    </div>
                                    {formData.theme_preference === 'system' && (
                                        <Check className="w-5 h-5 text-sakura-500"/>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                </div>

                <div className="flex justify-between pt-4">
                    {section === 'setup' && (
                        <>
                            {step > 1 ? (
                                <button
                                    onClick={() => setStep(step - 1)}
                                    className="px-6 py-2 rounded-lg text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                                >
                                    Retour
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleNextSection('welcome')}
                                    className="px-6 py-2 rounded-lg text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                                >
                                    Retour à l'accueil
                                </button>
                            )}

                            <button
                                onClick={() => {
                                    console.log('Button clicked, current step:', step);
                                    if (step < 4) {
                                        setStep(step + 1);
                                    } else {
                                        console.log('Calling handleSubmit from button click');
                                        handleSubmit();
                                    }
                                }}
                                disabled={
                                    (step === 1 && !formData.name) ||
                                    (step === 2 && !formData.email) ||
                                    (step === 3 && !formData.password)
                                    // Step 4 (theme selection) has no required validation
                                }
                                className="ml-auto px-6 py-2 rounded-lg bg-sakura-500 text-white
                transition-all disabled:bg-gray-400 disabled:cursor-not-allowed
                hover:shadow-[0_0_20px_rgba(244,163,187,0.5)] hover:bg-sakura-400"
                            >
                                {step === 4 ? 'Lancer E-audit' : 'Continuer'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Onboarding;