import { useState, useRef, useEffect } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const LocationAutocomplete = ({
  value,
  onChange,
  placeholder = 'Enter a location',
  className = '',
}: LocationAutocompleteProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const autocompleteRef = useRef<HTMLInputElement>(null);
  const autocompleteInstance = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    const loadGoogleMapsScript = async () => {
      try {
        const loader = new Loader({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
          version: 'weekly',
          libraries: ['places'],
        });

        await loader.load();

        if (autocompleteRef.current) {
          autocompleteInstance.current = new google.maps.places.Autocomplete(
            autocompleteRef.current,
            {
              types: ['(cities)'],
              componentRestrictions: { country: 'in' }, // Restrict to India
              fields: ['formatted_address', 'geometry', 'name'],
            }
          );

          autocompleteInstance.current.addListener('place_changed', () => {
            const place = autocompleteInstance.current?.getPlace();
            if (place?.formatted_address) {
              onChange(place.formatted_address);
            }
          });
        }
      } catch (error) {
        console.error('Error loading Google Maps API:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadGoogleMapsScript();

    return () => {
      if (autocompleteInstance.current) {
        google.maps.event.clearInstanceListeners(autocompleteInstance.current);
      }
    };
  }, [onChange]);

  return (
    <div className="relative">
      <input
        ref={autocompleteRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={isLoading}
        className={`w-full rounded-md border border-gray-300 px-4 py-2 pl-10 focus:border-blue-500 focus:ring-blue-500 ${className} ${
          isLoading ? 'bg-gray-100' : ''
        }`}
      />
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg
          className="h-5 w-5 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      {isLoading && (
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;
