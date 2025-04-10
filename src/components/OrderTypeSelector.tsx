
import { useOrder } from '@/contexts/OrderContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, isValid, parse } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const OrderTypeSelector = () => {
  const { isSpecialOrder, setIsSpecialOrder, deliveryDate, setDeliveryDate } = useOrder();
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Function to get next Sunday's date
  const getNextSunday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday, etc.
    const daysUntilNextSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
    
    const nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + daysUntilNextSunday);
    return nextSunday;
  };

  // Function to check if a date is a Sunday
  const isSunday = (date: Date) => {
    return date.getDay() === 0;
  };

  // Function to handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setDeliveryDate(format(date, 'yyyy-MM-dd'));
      setCalendarOpen(false);
    } else {
      setDeliveryDate(null);
    }
  };

  // Get the selected date as a Date object
  const selectedDate = deliveryDate 
    ? parse(deliveryDate, 'yyyy-MM-dd', new Date()) 
    : undefined;

  return (
    <div className="bg-card rounded-lg border shadow-sm p-4 my-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-lg mb-1">Order Type</h3>
          <p className="text-sm text-muted-foreground">
            {isSpecialOrder 
              ? "Special orders can be delivered any day" 
              : "Regular orders are delivered on Sundays only"}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="special-order" className="text-sm">Special Order</Label>
          <Switch
            id="special-order"
            checked={isSpecialOrder}
            onCheckedChange={(checked) => {
              setIsSpecialOrder(checked);
              // Reset the delivery date when toggling
              setDeliveryDate(null);
              toast({
                title: checked ? "Special Order Selected" : "Regular Order Selected",
                description: checked 
                  ? "You can now select any delivery date" 
                  : "Delivery is available on Sundays only",
              });
            }}
          />
        </div>
      </div>

      <div className="mt-4">
        <h3 className="font-medium mb-2">Delivery Date</h3>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !deliveryDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {deliveryDate && isValid(selectedDate) 
                ? format(selectedDate, 'PPP') 
                : <span>Select delivery date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => {
                // Disable past dates
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isPastDate = date < today;
                
                // For regular orders, only allow Sundays
                if (!isSpecialOrder) {
                  return isPastDate || !isSunday(date);
                }
                
                return isPastDate;
              }}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default OrderTypeSelector;
