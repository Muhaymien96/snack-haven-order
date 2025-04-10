
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { MessageSquare, Send, Cake } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { ContactFormType } from '@/types';

const Contact = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ContactFormType>({
    name: '',
    company: '',
    email: '',
    mobileNumber: '',
    message: '',
    type: 'query',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (value: 'query' | 'partnership') => {
    setFormData(prev => ({ ...prev, type: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Insert into Supabase contact_forms table
      const { data, error } = await supabase
        .from('contact_forms')
        .insert({
          name: formData.name,
          company: formData.company || null,
          email: formData.email,
          mobile_number: formData.mobileNumber,
          message: formData.message,
          type: formData.type,
          recipient_email: 't.dollie982@gmail.com' // Store the recipient email
        });
      
      if (error) throw error;
      
      toast.success('Your message has been sent! We will get back to you soon.');
      setFormData({
        name: '',
        company: '',
        email: '',
        mobileNumber: '',
        message: '',
        type: 'query',
      });
    } catch (error) {
      console.error('Contact form submission error:', error);
      toast.error(error.message ||'Failed to send your message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-custom py-12">
      <div className="flex justify-center mb-8">
        <div className="flex flex-col items-center">
          <Cake size={48} className="text-amber-800 mb-2" />
          <h1 className="text-3xl font-bold text-amber-800 text-center">Contact Thaneya's Treats</h1>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Get in Touch</CardTitle>
              <CardDescription>
                Have questions or need help with your order? Send us a message and we'll get back to you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center p-4 bg-amber-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-amber-800 mr-3" />
                <div>
                  <h3 className="font-medium">WhatsApp Support</h3>
                  <p className="text-sm text-muted-foreground">
                    Message us directly on WhatsApp for quick assistance
                  </p>
                  <a 
                    href="https://wa.me/27722277345" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-amber-800 hover:underline"
                  >
                    Open WhatsApp Chat
                  </a>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Business Hours</h3>
                <ul className="space-y-1 text-sm">
                  <li><span className="font-medium">Monday - Friday:</span> 9:00 AM - 5:00 PM</li>
                  <li><span className="font-medium">Saturday:</span> 9:00 AM - 2:00 PM</li>
                  <li><span className="font-medium">Sunday:</span> Closed (Delivery Day)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Send a Message</CardTitle>
              <CardDescription>
                Fill out the form below to send us a message
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Your name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company">Company (Optional)</Label>
                  <Input
                    id="company"
                    name="company"
                    placeholder="Your company"
                    value={formData.company}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your.email@example.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mobileNumber">Mobile Number</Label>
                  <Input
                    id="mobileNumber"
                    name="mobileNumber"
                    placeholder="073 123 4567"
                    required
                    value={formData.mobileNumber}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Message Type</Label>
                  <RadioGroup 
                    defaultValue={formData.type} 
                    value={formData.type}
                    onValueChange={handleRadioChange as (value: string) => void}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="query" id="query" />
                      <Label htmlFor="query">General Query</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="partnership" id="partnership" />
                      <Label htmlFor="partnership">Business Partnership</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Your message here..."
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-amber-800 hover:bg-amber-700" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : (
                    <>
                      Send Message <Send className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;
