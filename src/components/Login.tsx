import React from 'react';
import { signInWithGoogle } from '../firebase';
import { motion } from 'motion/react';
import { LogIn } from 'lucide-react';

const Login = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card p-8 rounded-[32px] shadow-xl max-w-md w-full text-center border border-border"
      >
        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <LogIn className="text-primary-foreground w-10 h-10" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Cana Express</h1>
        <p className="text-muted-foreground mb-8 font-serif italic">Entre com sua conta Google para gerenciar suas entregas</p>
        
        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 bg-card border-2 border-primary text-primary py-4 rounded-full font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-300 group"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Entrar com Google
        </button>
        
        <p className="mt-8 text-xs text-muted-foreground uppercase tracking-widest font-sans">
          Sistema de Gestão de Entregas
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
