import { SignUp } from "@clerk/clerk-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C084FC] to-[#8040C0] items-center justify-center shadow-lg shadow-purple-900/20 mb-4">
            <span className="font-bold text-white text-3xl">W</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Create Your Account</h1>
          <p className="text-gray-400 text-sm">Start building powerful workflows in minutes</p>
        </div>
        
        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-[#1C1C1E] border border-[#333] shadow-xl",
              headerTitle: "text-white",
              headerSubtitle: "text-gray-400",
              socialButtonsBlockButton: "bg-[#28282B] border-[#333] text-white hover:bg-[#333]",
              formButtonPrimary: "bg-[#C084FC] hover:bg-[#A855F7] text-white",
              formFieldInput: "bg-[#28282B] border-[#333] text-white",
              formFieldLabel: "text-gray-300",
              footerActionLink: "text-[#C084FC] hover:text-[#A855F7]",
              identityPreviewText: "text-white",
              identityPreviewEditButton: "text-[#C084FC]",
            },
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          afterSignUpUrl="/"
        />
      </div>
    </div>
  );
}
