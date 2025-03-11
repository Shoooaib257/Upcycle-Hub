import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Define form schema
const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Message sent",
        description: "Thank you for contacting us. We'll respond shortly.",
      });
      form.reset();
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="bg-neutral min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-heading font-bold text-4xl mb-4">Contact Us</h1>
          <p className="max-w-2xl mx-auto text-lg">
            Have questions about upcycled products or need assistance? We're here to help!
          </p>
        </div>
      </section>

      {/* Contact Information and Form */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="md:col-span-1">
              <h2 className="font-heading font-bold text-2xl mb-6">Get in Touch</h2>
              
              <div className="space-y-6">
                <Card className="border-none">
                  <CardContent className="p-4 flex items-start space-x-4">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-heading font-semibold text-base">Our Location</h3>
                      <p className="text-gray-600 text-sm">
                        123 Sustainable Street<br />
                        Eco City, EC 12345<br />
                        United States
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-none">
                  <CardContent className="p-4 flex items-start space-x-4">
                    <Phone className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-heading font-semibold text-base">Phone</h3>
                      <p className="text-gray-600 text-sm">
                        (555) 123-4567<br />
                        Monday to Friday, 9am to 5pm
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-none">
                  <CardContent className="p-4 flex items-start space-x-4">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-heading font-semibold text-base">Email</h3>
                      <p className="text-gray-600 text-sm">
                        info@ecorevive.com<br />
                        support@ecorevive.com
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-none">
                  <CardContent className="p-4 flex items-start space-x-4">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-heading font-semibold text-base">Hours</h3>
                      <p className="text-gray-600 text-sm">
                        Monday - Friday: 9am - 5pm<br />
                        Saturday: 10am - 2pm<br />
                        Sunday: Closed
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="md:col-span-2">
              <Card className="border-none shadow-md">
                <CardContent className="p-6">
                  <h2 className="font-heading font-bold text-2xl mb-6">Send Us a Message</h2>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="your@email.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                              <Input placeholder="How can we help you?" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Your message..." 
                                className="min-h-32"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Please provide as much detail as possible so we can best assist you.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button
                        type="submit"
                        className="bg-primary text-white w-full sm:w-auto"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="font-heading font-bold text-3xl text-center mb-10">Frequently Asked Questions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-heading font-semibold text-lg mb-2">How do I know if a product is truly upcycled?</h3>
                <p className="text-gray-600">
                  All products on EcoRevive include detailed information about the materials used and the upcycling process. We verify seller claims and promote transparency about product origins.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-heading font-semibold text-lg mb-2">Can I return an upcycled product?</h3>
                <p className="text-gray-600">
                  Yes, we have a 14-day return policy. However, given the unique nature of upcycled items, we encourage reviewing product details carefully before purchasing.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-heading font-semibold text-lg mb-2">How can I become a seller on EcoRevive?</h3>
                <p className="text-gray-600">
                  You can register as a seller by creating an account and completing the seller application. We review all applications to ensure alignment with our sustainability values.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-heading font-semibold text-lg mb-2">Do you ship internationally?</h3>
                <p className="text-gray-600">
                  Yes, we offer international shipping. Shipping costs and timeframes vary by location. We strive to use eco-friendly packaging for all shipments.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
