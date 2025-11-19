// src/app/page.tsx
import HeroCarousel from '@/components/HeroCarousel';
import FullScreenSection from '@/components/FullScreenSection';

export default function HomePage() {
  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory">
      
      <section className="h-screen w-full snap-start flex items-center justify-center pt-14">
        <div className="w-[90%] h-[75vh]">
          <HeroCarousel />
        </div>
      </section>

      {/* Add the 'href' prop to each section */}
      <FullScreenSection
        title="Explore all Turfs"
        subtitle="Find the best football and cricket turfs near you"
        imageUrl="/images/cantonment-turf.jpg"
        href="/sports/turfs" 
      />

      <FullScreenSection
        title="Swimming Pools"
        subtitle="Dive into our refreshing pools"
        imageUrl="/images/swimming.jpg"
        href="/sports/swimming-pools"
      />

      <FullScreenSection
        title="Badminton Courts"
        subtitle="Book a court for your next match"
        imageUrl="/images/badminton.jpg"
        href="/sports/badminton"
      />

      <FullScreenSection
        title="Snooker Clubs"
        subtitle="Find a table and start playing"
        imageUrl="/images/snooker.jpg"
        href="/sports/snooker"
      />

    </div>
  );
}