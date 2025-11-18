export const OverlayGuide = () => {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">      
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Oval guide - 타원 가이드 */}
        <div 
          className="absolute border-4 border-green-500 rounded-full"
          style={{
            width: '170px',
            height: '220px',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
          }}
        />
        
        {/* Top guide text */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 text-white text-sm font-semibold bg-black/60 px-4 py-2 rounded-lg z-10">
          얼굴을 타원 안에 맞춰주세요
        </div>
      </div>    
    </div>    
  );
};
