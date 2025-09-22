import GoogleSignInButton from "@/components/GoogleSiginButton";

export default function LoginPage() {
  return (
    <main className="flex flex-col lg:flex-row min-h-screen font-sans">
      {/* Sección Izquierda */}
      <section className="w-full lg:w-1/2 flex flex-col justify-center items-start bg-gradient-to-br from-[#ffd700] to-[#ffb347] relative text-center px-6 py-8 lg:px-0 lg:py-0 min-h-[40vh] lg:min-h-screen">
        <div className="flex flex-col items-center w-full lg:w-[calc(100%-60px)] lg:ml-0 lg:justify-center lg:h-full">
          <img
            src="/images/logo-chefcito.png"
            alt="Logo Chefcito AI"
            className="w-72 sm:w-96 lg:w-[400px] max-w-[90%] h-auto mb-4"
          />
        </div>
      </section>

      {/* Sección Derecha */}
      <section className="w-full lg:w-[54%] flex justify-center items-center p-6 sm:p-8 lg:p-10 bg-white lg:rounded-tl-[60px] lg:rounded-bl-[60px] lg:-ml-[60px] z-30 lg:shadow-[-8px_0_24px_rgba(0,0,0,0.04)] relative min-h-[60vh] lg:min-h-screen">
        <div className="bg-white rounded-2xl p-6 sm:p-8 lg:p-12 shadow-[0_16px_48px_rgba(0,0,0,0.28)] text-center max-w-[400px] w-full mx-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#333] mb-4 lg:mb-5">¡Bienvenido!</h2>
          <p className="text-base sm:text-lg text-[#666] mb-6 lg:mb-10 leading-relaxed">Inicia sesión para comenzar</p>
          <GoogleSignInButton />
          <p className="text-xs sm:text-sm text-[#999] leading-snug mb-0 px-2">
            Al continuar, se creará tu cuenta automáticamente si es tu primera vez
          </p>
        </div>
      </section>
    </main>
  );
}
